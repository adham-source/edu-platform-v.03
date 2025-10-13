import * as Minio from 'minio';

export class MinioClient {
  private static instance: Minio.Client;

  private constructor() {}

  public static getInstance(): Minio.Client {
    if (!MinioClient.instance) {
      const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
      const port = parseInt(process.env.MINIO_PORT || '9000', 10);
      const useSSL = process.env.MINIO_USE_SSL === 'true';
      const accessKey = process.env.MINIO_ACCESS_KEY || '';
      const secretKey = process.env.MINIO_SECRET_KEY || '';

      MinioClient.instance = new Minio.Client({
        endPoint: endpoint,
        port: port,
        useSSL: useSSL,
        accessKey: accessKey,
        secretKey: secretKey,
      });
      console.log('Backend MinIO Client Initialized');
    }
    return MinioClient.instance;
  }
}
