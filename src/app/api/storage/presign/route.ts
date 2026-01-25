/**
 * OSS Presign API - Generate signed upload credentials for direct browser-to-OSS upload
 * This bypasses Vercel's 4.5MB request body limit
 * input: filename, contentType
 * output: Signed upload URL and form fields
 * pos: src/app/api/storage/presign/route.ts
 */

import crypto from 'crypto';

import { envConfigs } from '@/config';
import { respData, respErr } from '@/shared/lib/resp';

// Supported MIME types
const SUPPORTED_MIME_TYPES: Record<string, string> = {
  // Video
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
  'video/x-msvideo': 'avi',
  'video/x-matroska': 'mkv',
  'video/mpeg': 'mpeg',
  'video/3gpp': '3gp',
  'video/x-flv': 'flv',
  // Image
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Max file size: 500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;

// Policy expiration: 1 hour
const POLICY_EXPIRATION_SECONDS = 3600;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { filename, contentType, fileSize } = body;

    if (!filename || !contentType) {
      return respErr('Missing filename or contentType');
    }

    // Validate content type
    if (!SUPPORTED_MIME_TYPES[contentType]) {
      return respErr(`Unsupported format: ${contentType}`);
    }

    // Validate file size if provided
    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return respErr(
        `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Get OSS configs
    const region = envConfigs.aliyun_oss_region;
    const accessKeyId = envConfigs.aliyun_oss_access_key_id;
    const accessKeySecret = envConfigs.aliyun_oss_access_key_secret;
    const bucket = envConfigs.aliyun_oss_bucket;
    const publicDomain = envConfigs.aliyun_oss_public_domain;

    if (!region || !accessKeyId || !accessKeySecret || !bucket) {
      return respErr('OSS not configured');
    }

    // Generate unique key
    const ext =
      SUPPORTED_MIME_TYPES[contentType] || filename.split('.').pop() || 'bin';
    const isVideo = contentType.startsWith('video/');
    const folder = isVideo ? 'videos' : 'images';
    const timestamp = Date.now();
    const randomStr = crypto.randomBytes(8).toString('hex');
    const key = `${folder}/${timestamp}-${randomStr}.${ext}`;

    // Generate policy (valid for 1 hour)
    const expiration = new Date(
      Date.now() + POLICY_EXPIRATION_SECONDS * 1000
    ).toISOString();
    const policy = {
      expiration,
      conditions: [
        { bucket },
        ['eq', '$key', key],
        ['content-length-range', 0, MAX_FILE_SIZE],
        ['eq', '$Content-Type', contentType],
      ],
    };

    const policyBase64 = Buffer.from(JSON.stringify(policy)).toString('base64');
    const signature = crypto
      .createHmac('sha1', accessKeySecret)
      .update(policyBase64)
      .digest('base64');

    // OSS endpoint for form POST
    const endpoint = `https://${bucket}.${region}.aliyuncs.com`;

    // Public URL after upload
    const publicUrl = publicDomain
      ? `${publicDomain}/${key}`
      : `${endpoint}/${key}`;

    return respData({
      // For direct POST to OSS
      uploadUrl: endpoint,
      formFields: {
        key,
        policy: policyBase64,
        OSSAccessKeyId: accessKeyId,
        signature,
        'Content-Type': contentType,
        success_action_status: '200',
      },
      // Result info
      key,
      publicUrl,
      expiresAt: expiration,
    });
  } catch (e) {
    console.error('Presign failed:', e);
    return respErr('Failed to generate upload credentials');
  }
}
