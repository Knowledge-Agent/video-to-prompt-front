import { getUuid } from '@/shared/lib/hash';

import { saveFiles } from '.';
import {
  AIConfigs,
  AIFile,
  AIGenerateParams,
  AIImage,
  AIMediaType,
  AIProvider,
  AISong,
  AITaskResult,
  AITaskStatus,
  AIVideo,
} from './types';

/**
 * Replicate configs
 * @docs https://replicate.com/
 */
export interface ReplicateConfigs extends AIConfigs {
  baseUrl?: string;
  apiToken: string;
  customStorage?: boolean; // use custom storage to save files
}

/**
 * Replicate provider - using direct HTTP requests
 * @docs https://replicate.com/
 */
export class ReplicateProvider implements AIProvider {
  // provider name
  readonly name = 'replicate';
  // provider configs
  configs: ReplicateConfigs;

  // init provider
  constructor(configs: ReplicateConfigs) {
    this.configs = configs;
  }

  private async request(url: string, options: RequestInit = {}): Promise<any> {
    console.log('[Replicate] Request URL:', url);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.configs.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Request to ${url} failed with status ${response.status} ${response.statusText}: ${errorText}`);
    }

    return response.json();
  }

  // generate task
  async generate({
    params,
  }: {
    params: AIGenerateParams;
  }): Promise<AITaskResult> {
    const { mediaType, model, prompt, options, async, callbackUrl } = params;

    if (!mediaType) {
      throw new Error('mediaType is required');
    }

    if (!model) {
      throw new Error('model is required');
    }

    // SeedVR2 doesn't require prompt (it's video restoration, not generation)
    const isSeedVR2 = model.includes('seedvr2');
    if (!prompt && !isSeedVR2) {
      throw new Error('prompt is required');
    }

    // build request params
    const input: any = this.formatInput({
      mediaType,
      model,
      prompt: prompt || '',
      options,
    });

    const isValidCallbackUrl =
      callbackUrl &&
      callbackUrl.startsWith('http') &&
      !callbackUrl.includes('localhost') &&
      !callbackUrl.includes('127.0.0.1');

    console.log('[Replicate] Input:', input);

    // SeedVR2 使用完整的 version 字符串 (owner/model:hash)
    // 如果 model 已经包含 : 则直接使用，否则为 SeedVR2 添加默认 hash
    let version = model;
    if (!model.includes(':')) {
      if (model.includes('seedvr2')) {
        version = 'zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78';
      }
    }

    const requestBody = {
      version,
      input,
      ...(isValidCallbackUrl && {
        webhook: callbackUrl,
        webhook_events_filter: ['completed'],
      }),
    };

    console.log('[Replicate] Request body:', JSON.stringify(requestBody, null, 2));

    // 直接使用环境变量配置的完整 URL
    const apiUrl = this.configs.baseUrl || 'https://api.replicate.com/v1/predictions';

    const output = await this.request(apiUrl, {
      method: 'POST',
      headers: {
        'Prefer': 'wait',
      },
      body: JSON.stringify(requestBody),
    });

    return {
      taskStatus: AITaskStatus.PENDING,
      taskId: output.id,
      taskInfo: {},
      taskResult: output,
    };
  }

  // query task
  async query({
    taskId,
    mediaType,
  }: {
    taskId: string;
    mediaType?: AIMediaType;
  }): Promise<AITaskResult> {
    // 查询任务状态 - 使用 baseUrl 替换 predictions 为 predictions/{taskId}
    const baseUrl = this.configs.baseUrl || 'https://api.replicate.com/v1/predictions';
    const queryUrl = `${baseUrl}/${taskId}`;
    
    const data = await this.request(queryUrl, {
      method: 'GET',
    });

    let images: AIImage[] | undefined = undefined;
    let videos: AIVideo[] | undefined = undefined;

    if (data.output) {
      if (mediaType === AIMediaType.VIDEO) {
        // handle video output
        if (Array.isArray(data.output)) {
          videos = data.output.map((video: any) => ({
            id: '',
            createTime: new Date(data.created_at),
            videoUrl: video,
          }));
        } else if (typeof data.output === 'string') {
          videos = [
            {
              id: '',
              createTime: new Date(data.created_at),
              videoUrl: data.output,
            },
          ];
        }
      } else {
        // handle image output (default)
        if (Array.isArray(data.output)) {
          images = data.output.map((image: any) => ({
            id: '',
            createTime: new Date(data.created_at),
            imageUrl: image,
          }));
        } else if (typeof data.output === 'string') {
          images = [
            {
              id: '',
              createTime: new Date(data.created_at),
              imageUrl: data.output,
            },
          ];
        }
      }
    }

    const taskStatus = this.mapStatus(data.status);

    // save files to custom storage
    if (taskStatus === AITaskStatus.SUCCESS && this.configs.customStorage) {
      // save images
      if (images && images.length > 0) {
        const filesToSave: AIFile[] = [];
        images.forEach((image, index) => {
          if (image.imageUrl) {
            filesToSave.push({
              url: image.imageUrl,
              contentType: 'image/png',
              key: `replicate/image/${getUuid()}.png`,
              index: index,
              type: 'image',
            });
          }
        });

        if (filesToSave.length > 0) {
          const uploadedFiles = await saveFiles(filesToSave);
          if (uploadedFiles) {
            uploadedFiles.forEach((file: AIFile) => {
              if (file && file.url && images && file.index !== undefined) {
                const image = images[file.index];
                if (image) {
                  image.imageUrl = file.url;
                }
              }
            });
          }
        }
      }

      // save videos
      if (videos && videos.length > 0) {
        const filesToSave: AIFile[] = [];
        videos.forEach((video, index) => {
          if (video.videoUrl) {
            filesToSave.push({
              url: video.videoUrl,
              contentType: 'video/mp4',
              key: `replicate/video/${getUuid()}.mp4`,
              index: index,
              type: 'video',
            });
          }
        });

        if (filesToSave.length > 0) {
          const uploadedFiles = await saveFiles(filesToSave);
          if (uploadedFiles) {
            uploadedFiles.forEach((file: AIFile) => {
              if (file && file.url && videos && file.index !== undefined) {
                const video = videos[file.index];
                if (video) {
                  video.videoUrl = file.url;
                }
              }
            });
          }
        }
      }
    }

    return {
      taskId,
      taskStatus,
      taskInfo: {
        images,
        videos,
        status: data.status,
        errorCode: '',
        errorMessage: data.error as string,
        createTime: new Date(data.created_at),
      },
      taskResult: data,
    };
  }

  // map status
  private mapStatus(status: string): AITaskStatus {
    switch (status) {
      case 'starting':
        return AITaskStatus.PENDING;
      case 'processing':
        return AITaskStatus.PROCESSING;
      case 'succeeded':
        return AITaskStatus.SUCCESS;
      case 'failed':
        return AITaskStatus.FAILED;
      case 'canceled':
        return AITaskStatus.CANCELED;
      default:
        throw new Error(`unknown status: ${status}`);
    }
  }

  private formatInput({
    mediaType,
    model,
    prompt,
    options,
  }: {
    mediaType: AIMediaType;
    model: string;
    prompt: string;
    options: any;
  }): any {
    // SeedVR2 video restoration model - 严格按照 API 文档
    // 只需要: media, fps, output_format, output_quality, apply_color_fix
    if (model.includes('seedvr2')) {
      // 获取 media URL
      let media = '';
      if (options?.video_input?.[0]) {
        media = options.video_input[0];
      } else if (options?.image_input?.[0]) {
        media = options.image_input[0];
      } else if (options?.media) {
        media = options.media;
      }

      // 只返回 API 文档要求的参数
      return {
        media,
        fps: options?.fps ?? 24,
        output_format: options?.output_format ?? 'webp',
        output_quality: options?.output_quality ?? 90,
        apply_color_fix: options?.apply_color_fix ?? true,
      };
    }

    let input: any = {
      prompt,
    };

    if (!options) {
      return input;
    }

    // input with all custom options
    input = {
      ...input,
      ...options,
    };

    // default options
    // image_input
    // duration
    // aspect_ratio

    // image_input transform
    if (options.image_input && Array.isArray(options.image_input)) {
      if (['black-forest-labs/flux-2-pro'].includes(model)) {
        input.input_images = options.image_input;
        delete input.image_input;
      } else if (['google/veo-3.1'].includes(model)) {
        input.reference_images = input.image_input;
        delete input.image_input;
      } else if (['openai/sora-2'].includes(model)) {
        input.input_reference = options.image_input[0];
        delete input.image_input;
      }
    }

    // duration transform
    if (options.duration) {
      if (['openai/sora-2'].includes(model)) {
        input.seconds = Number(options.duration);
        delete input.duration;
      }
    }

    return input;
  }
}
