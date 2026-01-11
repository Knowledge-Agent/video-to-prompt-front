/**
 * Aliyun OSS Storage Provider
 * input: File buffer, key, content type
 * output: Public URL of uploaded file
 * pos: src/extensions/storage/aliyun-oss.ts
 */

import crypto from 'crypto';

import type {
  StorageConfigs,
  StorageDownloadUploadOptions,
  StorageProvider,
  StorageUploadOptions,
  StorageUploadResult,
} from '.';

/**
 * Aliyun OSS storage provider configs
 * @docs https://help.aliyun.com/document_detail/31947.html
 */
export interface AliyunOSSConfigs extends StorageConfigs {
  region: string; // e.g., oss-cn-hangzhou
  accessKeyId: string;
  accessKeySecret: string;
  bucket: string;
  publicDomain?: string; // Custom CDN domain
}

/**
 * Aliyun OSS storage provider implementation
 * @website https://www.aliyun.com/product/oss
 */
export class AliyunOSSProvider implements StorageProvider {
  readonly name = 'aliyun-oss';
  configs: AliyunOSSConfigs;

  constructor(configs: AliyunOSSConfigs) {
    this.configs = configs;
  }

  private getEndpoint(): string {
    return `https://${this.configs.bucket}.${this.configs.region}.aliyuncs.com`;
  }

  getPublicUrl = (options: { key: string; bucket?: string }): string => {
    if (this.configs.publicDomain) {
      return `${this.configs.publicDomain}/${options.key}`;
    }
    return `${this.getEndpoint()}/${options.key}`;
  };

  /**
   * Generate OSS signature for authentication
   * @docs https://help.aliyun.com/document_detail/31951.html
   */
  private generateSignature(
    method: string,
    contentType: string,
    date: string,
    canonicalizedResource: string
  ): string {
    const stringToSign = `${method}\n\n${contentType}\n${date}\n${canonicalizedResource}`;
    const signature = crypto
      .createHmac('sha1', this.configs.accessKeySecret)
      .update(stringToSign)
      .digest('base64');
    return signature;
  }

  async uploadFile(
    options: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const uploadBucket = options.bucket || this.configs.bucket;
      if (!uploadBucket) {
        return {
          success: false,
          error: 'Bucket is required',
          provider: this.name,
        };
      }

      const contentType = options.contentType || 'application/octet-stream';
      const date = new Date().toUTCString();
      const canonicalizedResource = `/${uploadBucket}/${options.key}`;

      const signature = this.generateSignature(
        'PUT',
        contentType,
        date,
        canonicalizedResource
      );

      const url = `${this.getEndpoint()}/${options.key}`;
      
      console.log('[AliyunOSS] Uploading to:', url);
      console.log('[AliyunOSS] Bucket:', uploadBucket);
      console.log('[AliyunOSS] Key:', options.key);

      // Convert body to Blob for fetch compatibility
      let bodyData: Blob;
      if (options.body instanceof Blob) {
        bodyData = options.body;
      } else if (options.body instanceof ArrayBuffer) {
        bodyData = new Blob([options.body], { type: contentType });
      } else if (ArrayBuffer.isView(options.body)) {
        // Handles Uint8Array, Buffer, etc. - copy to new Uint8Array
        const uint8 = new Uint8Array(
          options.body.buffer,
          options.body.byteOffset,
          options.body.byteLength
        );
        // Create a copy to ensure it's a regular ArrayBuffer
        const copy = new Uint8Array(uint8);
        bodyData = new Blob([copy], { type: contentType });
      } else if (typeof options.body === 'string') {
        bodyData = new Blob([options.body], { type: contentType });
      } else {
        // Fallback: try to convert to string
        bodyData = new Blob([String(options.body)], { type: contentType });
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
          Date: date,
          Authorization: `OSS ${this.configs.accessKeyId}:${signature}`,
        },
        body: bodyData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `Upload failed: ${response.status} - ${errorText}`,
          provider: this.name,
        };
      }

      const publicUrl = this.getPublicUrl({ key: options.key, bucket: uploadBucket });

      return {
        success: true,
        location: url,
        bucket: uploadBucket,
        key: options.key,
        filename: options.key.split('/').pop(),
        url: publicUrl,
        provider: this.name,
      };
    } catch (error) {
      console.error('[AliyunOSS] Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }

  async downloadAndUpload(
    options: StorageDownloadUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const response = await fetch(options.url);
      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          provider: this.name,
        };
      }

      if (!response.body) {
        return {
          success: false,
          error: 'No body in response',
          provider: this.name,
        };
      }

      const arrayBuffer = await response.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);

      return this.uploadFile({
        body,
        key: options.key,
        bucket: options.bucket,
        contentType: options.contentType,
        disposition: options.disposition,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider: this.name,
      };
    }
  }

  exists = async (options: { key: string; bucket?: string }): Promise<boolean> => {
    try {
      const uploadBucket = options.bucket || this.configs.bucket;
      if (!uploadBucket) return false;

      const date = new Date().toUTCString();
      const canonicalizedResource = `/${uploadBucket}/${options.key}`;
      const signature = this.generateSignature('HEAD', '', date, canonicalizedResource);

      const url = `${this.getEndpoint()}/${options.key}`;

      const response = await fetch(url, {
        method: 'HEAD',
        headers: {
          Date: date,
          Authorization: `OSS ${this.configs.accessKeyId}:${signature}`,
        },
      });

      return response.ok;
    } catch {
      return false;
    }
  };
}

/**
 * Create Aliyun OSS provider with configs
 */
export function createAliyunOSSProvider(configs: AliyunOSSConfigs): AliyunOSSProvider {
  return new AliyunOSSProvider(configs);
}
