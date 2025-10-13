import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import logger from '../config/logger';

export class MinioClient {
  private static instance: Minio.Client;
  private static initialized = false;

  private constructor() {}

  public static getInstance(): Minio.Client {
    if (!MinioClient.instance) {
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
      const port = parseInt(process.env.MINIO_PORT || '9000', 10);
      const useSSL = process.env.MINIO_USE_SSL === 'true';
      const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
      const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

      MinioClient.instance = new Minio.Client({
        endPoint: endpoint,
        port: port,
        useSSL: useSSL,
        accessKey: accessKey,
        secretKey: secretKey,
      });
      
      logger.info('MinIO Client Initialized');
      MinioClient.initializeBuckets();
    }
    return MinioClient.instance;
  }

  private static async initializeBuckets() {
    if (MinioClient.initialized) return;
    
    try {
      const client = MinioClient.instance;
      const buckets = ['uploads', 'thumbnails', 'videos', 'processed-videos'];
      
      for (const bucket of buckets) {
        const exists = await client.bucketExists(bucket);
        if (!exists) {
          await client.makeBucket(bucket);
          logger.info(`Created MinIO bucket: ${bucket}`);
        }
      }
      
      MinioClient.initialized = true;
    } catch (error) {
      logger.error('Error initializing MinIO buckets:', error);
    }
  }

  public static async uploadFile(
    bucket: string,
    file: Buffer,
    originalName: string,
    contentType: string,
    folder?: string
  ): Promise<string> {
    try {
      const client = MinioClient.getInstance();
      const fileExtension = originalName.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const objectName = folder ? `${folder}/${fileName}` : fileName;

      // Ensure bucket exists
      const bucketExists = await client.bucketExists(bucket);
      if (!bucketExists) {
        await client.makeBucket(bucket);
      }

      await client.putObject(bucket, objectName, file, file.length, {
        'Content-Type': contentType,
        'Original-Name': originalName,
      });

      logger.info(`File uploaded to MinIO: ${bucket}/${objectName}`);
      return `${bucket}/${objectName}`;
    } catch (error) {
      logger.error('Error uploading file to MinIO:', error);
      throw error;
    }
  }

  public static async deleteFile(filePath: string): Promise<void> {
    try {
      const client = MinioClient.getInstance();
      const [bucket, ...objectParts] = filePath.split('/');
      const objectName = objectParts.join('/');

      await client.removeObject(bucket, objectName);
      logger.info(`File deleted from MinIO: ${filePath}`);
    } catch (error) {
      logger.error('Error deleting file from MinIO:', error);
      throw error;
    }
  }

  public static async getFileUrl(filePath: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      const client = MinioClient.getInstance();
      const [bucket, ...objectParts] = filePath.split('/');
      const objectName = objectParts.join('/');

      const url = await client.presignedGetObject(bucket, objectName, expiry);
      return url;
    } catch (error) {
      logger.error('Error generating file URL:', error);
      throw error;
    }
  }

  public static async fileExists(filePath: string): Promise<boolean> {
    try {
      const client = MinioClient.getInstance();
      const [bucket, ...objectParts] = filePath.split('/');
      const objectName = objectParts.join('/');

      await client.statObject(bucket, objectName);
      return true;
    } catch (error) {
      return false;
    }
  }
}
