import dotenv from 'dotenv';
import amqp from 'amqplib';
import { MinioClient } from './minio-client';
import connectDB from './db';
import Lesson from './models/Lesson.model';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';

// Configure ffmpeg path
ffmpeg.setFfmpegPath('/usr/bin/ffmpeg');

// Load environment variables
dotenv.config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

// Connect to MongoDB
connectDB();

async function main() {
  console.log('Video Processing Service starting...');

  try {
    // 1. Connect to RabbitMQ
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');

    // 2. Assert a queue
    const queue = 'video-processing-queue';
    await channel.assertQueue(queue, { durable: true });

    // 3. Initialize MinIO client
    const minio = MinioClient.getInstance();
    console.log('MinIO Client Initialized');

    // 4. Start consuming messages
    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        console.log('[x] Received:', msg.content.toString());
        const message = JSON.parse(msg.content.toString());
        const { lessonId, originalFilePath } = message;

        let lessonStatus: 'READY' | 'FAILED' = 'FAILED';
        let processedVideoUrl: string | undefined;
        let tempDir: string = ''; // Initialize with empty string
        let originalFileName: string = ''; // Initialize with empty string
        let originalLocalPath: string = ''; // Initialize with empty string

        try {
          console.log(`Processing lesson: ${lessonId} from ${originalFilePath}`);
          await Lesson.findByIdAndUpdate(lessonId, { status: 'PROCESSING' });

          const minio = MinioClient.getInstance();
          const PROCESSED_BUCKET = 'processed-videos';
          const UPLOAD_BUCKET = 'uploads';

          // Ensure processed bucket exists
          const bucketExists = await minio.bucketExists(PROCESSED_BUCKET);
          if (!bucketExists) {
            await minio.makeBucket(PROCESSED_BUCKET);
          }

          // 1. Download original video from MinIO
          tempDir = `/tmp/${uuidv4()}`;
          fs.mkdirSync(tempDir, { recursive: true });
          originalFileName = path.basename(originalFilePath);
          originalLocalPath = path.join(tempDir, originalFileName);

          await minio.fGetObject(UPLOAD_BUCKET, originalFileName, originalLocalPath);
          console.log(`Downloaded ${originalFileName} to ${originalLocalPath}`);

          // 2. Transcode with FFmpeg to multiple resolutions
          const resolutions = [
            { name: '480p', width: 854, height: 480, bitrate: '1000k' },
            { name: '720p', width: 1280, height: 720, bitrate: '2500k' },
            { name: '1080p', width: 1920, height: 1080, bitrate: '5000k' },
          ];

          const transcodedFiles: { resolution: string; path: string }[] = [];
          for (const res of resolutions) {
            const outputFileName = `${path.parse(originalFileName).name}-${res.name}.mp4`;
            const outputLocalPath = path.join(tempDir, outputFileName);
            await new Promise<void>((resolve, reject) => {
              ffmpeg(originalLocalPath)
                .outputOptions([
                  `-vf scale=${res.width}:${res.height}`,
                  `-b:v ${res.bitrate}`,
                  `-c:v libx264`,
                  `-preset veryfast`,
                  `-c:a aac`,
                  `-b:a 128k`,
                ])
                .on('end', () => {
                  console.log(`Transcoding ${res.name} finished`);
                  transcodedFiles.push({ resolution: res.name, path: outputLocalPath });
                  resolve();
                })
                .on('error', (err) => {
                  console.error(`Transcoding ${res.name} error:`, err);
                  reject(err);
                })
                .save(outputLocalPath);
            });
          }

          // 3. Package with Shaka Packager (DASH and HLS)
          const outputBaseName = path.parse(originalFileName).name;
          const dashManifestPath = path.join(tempDir, `${outputBaseName}.mpd`);
          const hlsManifestPath = path.join(tempDir, `${outputBaseName}.m3u8`);

          // Placeholder for DRM keys (replace with actual key management in production)
          const keyId = 'eb67645e-591c-528c-a2d0-f6850b99e27f';
          const key = '100b6c20940f779a6c489557e2d2a118';

          const packagerCommand = `shaka-packager \
            ${transcodedFiles.map(f => `input=${f.path},stream=audio,output=${path.join(tempDir, `${outputBaseName}_audio.mp4`)}`).join(' \
            ')} \
            ${transcodedFiles.map(f => `input=${f.path},stream=video,output=${path.join(tempDir, `${outputBaseName}_video_${f.resolution}.mp4`)}`).join(' \
            ')} \
            --enable_text_encryption \
            --enable_raw_key_decryption \
            --protection_scheme CENC \
            --clear_lead 0 \
            --keys label=audio:key_id=${keyId}:key=${key},label=video:key_id=${keyId}:key=${key} \
            --mpd_output ${dashManifestPath} \
            --hls_master_playlist_output ${hlsManifestPath}`;

          console.log('Running Shaka Packager command:', packagerCommand);
          await new Promise<void>((resolve, reject) => {
            exec(packagerCommand, { cwd: tempDir }, (error, stdout, stderr) => {
              if (error) {
                console.error(`Shaka Packager error: ${error.message}`);
                console.error(`Shaka Packager stderr: ${stderr}`);
                return reject(error);
              }
              console.log(`Shaka Packager stdout: ${stdout}`);
              resolve();
            });
          });
          console.log('Shaka Packager finished');

          // 4. Upload processed files to MinIO
          const filesToUpload = fs.readdirSync(tempDir).filter(f => f.endsWith('.mpd') || f.endsWith('.m3u8') || f.endsWith('.mp4'));
          const manifestBaseUrl = `${PROCESSED_BUCKET}/${lessonId}/`;
          for (const file of filesToUpload) {
            const fileLocalPath = path.join(tempDir, file);
            const fileMinioPath = `${lessonId}/${file}`;
            await minio.fPutObject(PROCESSED_BUCKET, fileMinioPath, fileLocalPath, {});
            console.log(`Uploaded ${file} to MinIO at ${PROCESSED_BUCKET}/${fileMinioPath}`);
          }
          processedVideoUrl = `${manifestBaseUrl}${outputBaseName}.mpd`; // Store DASH manifest URL
          lessonStatus = 'READY';

        } catch (error) {
          console.error('Error during video processing:', error);
          lessonStatus = 'FAILED';
        } finally {
          // 5. Update Lesson status in MongoDB
          await Lesson.findByIdAndUpdate(lessonId, { status: lessonStatus, videoUrl: processedVideoUrl });
          console.log(`Lesson ${lessonId} status updated to ${lessonStatus}`);

          // 6. Clean up temporary files
          if (tempDir) {
            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log(`Cleaned up temporary directory: ${tempDir}`);
          }

          // Acknowledge the message
          channel.ack(msg);
          console.log('[x] Done processing message.');
        }
      }
    });

  } catch (error) {
    console.error('Failed to start the service:', error);
    process.exit(1);
  }
}

main().catch(console.error);