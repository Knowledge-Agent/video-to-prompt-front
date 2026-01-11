/**
 * Media Upload API (Video + Image)
 * input: Video or Image file (multipart/form-data)
 * output: Public URL of uploaded media
 * pos: src/app/api/storage/upload-media/route.ts
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

// Supported image MIME types
const IMAGE_MIME_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// All supported MIME types
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  ...VIDEO_MIME_TYPES,
  ...IMAGE_MIME_TYPES,
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

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    const mediaType = isVideo ? 'video' : isImage ? 'image' : 'unknown';

    console.log('[API] Received media file:', {
      name: file.name,
      type: file.type,
      size: file.size,
      mediaType,
    });

    // Validate file type
    if (!SUPPORTED_MIME_TYPES[file.type]) {
      return respErr(`Unsupported format: ${file.type}. Supported: MP4, WebM, MOV, AVI, MKV, JPG, PNG, WebP, GIF`);
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
    const ext = SUPPORTED_MIME_TYPES[file.type] || file.name.split('.').pop() || 'bin';
    const timestamp = Date.now();
    const folder = isVideo ? 'videos' : 'images';
    const key = `${folder}/${timestamp}-${digest}.${ext}`;

    // Get storage service
    const storageService = await getStorageService();
    
    // Check if any provider is configured
    if (!storageService.hasProvider()) {
      console.error('[API] No storage provider configured');
      return respErr('No storage provider configured. Please configure storage in .env file.');
    }
    
    console.log('[API] Storage providers:', storageService.getProviderNames());

    // Check if file already exists (deduplication)
    const exists = await storageService.exists({ key });
    if (exists) {
      const publicUrl = storageService.getPublicUrl({ key });
      if (publicUrl) {
        console.log('[API] Media already exists, returning cached URL:', publicUrl);
        return respData({
          url: publicUrl,
          key,
          filename: file.name,
          size: file.size,
          mediaType,
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
      console.error('[API] Media upload failed:', result.error);
      return respErr(result.error || 'Upload failed');
    }

    console.log('[API] Media upload success:', result.url);

    return respData({
      url: result.url,
      key: result.key,
      filename: file.name,
      size: file.size,
      mediaType,
      deduped: false,
    });
  } catch (e) {
    console.error('Media upload failed:', e);
    return respErr('Media upload failed');
  }
}
