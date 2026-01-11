/**
 * Video Upload API
 * input: Video file (multipart/form-data)
 * output: Public URL of uploaded video
 * pos: src/app/api/storage/upload-video/route.ts
 */

import { md5 } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getStorageService } from '@/shared/services/storage';

// Supported video MIME types
const VIDEO_MIME_TYPES: Record<string, string> = {
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'video/mpeg': 'mpeg',
  'video/3gpp': '3gp',
  'video/x-flv': 'flv',
};

// Max file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return respErr('No file provided');
    }

    console.log('[API] Received video file:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!VIDEO_MIME_TYPES[file.type]) {
      return respErr(`Unsupported video format: ${file.type}. Supported formats: MP4, WebM, MOV, AVI, MKV`);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return respErr(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`);
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const body = new Uint8Array(arrayBuffer);

    // Generate unique key based on content hash
    const digest = md5(body);
    const ext = VIDEO_MIME_TYPES[file.type] || file.name.split('.').pop() || 'mp4';
    const timestamp = Date.now();
    const key = `videos/${timestamp}-${digest}.${ext}`;

    // Get storage service
    const storageService = await getStorageService();
    
    // Check if any provider is configured
    if (!storageService.hasProvider()) {
      console.error('[API] No storage provider configured');
      console.error('[API] Please set these env vars: ALIYUN_OSS_REGION, ALIYUN_OSS_ACCESS_KEY_ID, ALIYUN_OSS_ACCESS_KEY_SECRET, ALIYUN_OSS_BUCKET');
      return respErr('No storage provider configured. Please configure Aliyun OSS in .env file.');
    }
    
    console.log('[API] Storage providers:', storageService.getProviderNames());

    // Check if file already exists (deduplication)
    const exists = await storageService.exists({ key });
    if (exists) {
      const publicUrl = storageService.getPublicUrl({ key });
      if (publicUrl) {
        console.log('[API] Video already exists, returning cached URL:', publicUrl);
        return respData({
          url: publicUrl,
          key,
          filename: file.name,
          size: file.size,
          deduped: true,
        });
      }
    }

    // Upload to storage
    const result = await storageService.uploadFile({
      body,
      key,
      contentType: file.type,
      disposition: 'inline',
    });

    if (!result.success) {
      console.error('[API] Video upload failed:', result.error);
      return respErr(result.error || 'Upload failed');
    }

    console.log('[API] Video upload success:', result.url);

    return respData({
      url: result.url,
      key: result.key,
      filename: file.name,
      size: file.size,
      deduped: false,
    });
  } catch (e) {
    console.error('Video upload failed:', e);
    return respErr('Video upload failed');
  }
}
