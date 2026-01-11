/**
 * SeedVR2 视频修复 API
 * 直接调用算法端，严格按照 API 文档
 * pos: src/app/api/ai/seedvr2/route.ts
 */

import { envConfigs } from '@/config';
import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { getRemainingCredits, consumeCredits } from '@/shared/models/credit';

const COST_CREDITS = 10;
const POLL_INTERVAL = 3000; // 3秒轮询一次
const MAX_WAIT_TIME = 600000; // 最长等待10分钟

// 轮询等待任务完成
async function waitForCompletion(getUrl: string, apiToken: string): Promise<any> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < MAX_WAIT_TIME) {
    await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
    
    const response = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Poll failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[SeedVR2] Poll status:', result.status);
    
    if (result.status === 'succeeded') {
      return result;
    }
    
    if (result.status === 'failed') {
      throw new Error(result.error || 'Processing failed');
    }
    
    // starting, processing 继续等待
  }
  
  throw new Error('Timeout: processing took too long');
}

export async function POST(request: Request) {
  try {
    const { media, fps = 24, output_format = 'webp', output_quality = 90, apply_color_fix = true } = await request.json();

    if (!media) {
      throw new Error('media is required');
    }

    // 验证用户
    const user = await getUserInfo();
    if (!user) {
      throw new Error('Please sign in');
    }

    // 检查积分
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < COST_CREDITS) {
      throw new Error(`Insufficient credits. Need ${COST_CREDITS}, have ${remainingCredits}`);
    }

    // 获取 API 配置
    const apiUrl = envConfigs.replicate_api_url;
    const apiToken = envConfigs.replicate_api_token;

    if (!apiUrl || !apiToken) {
      throw new Error('API not configured');
    }

    // 发起请求
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait',
      },
      body: JSON.stringify({
        version: 'zsxkib/seedvr2:ca98249be9cb623f02a80a7851a2b1a33d5104c251a8f5a1588f251f79bf7c78',
        input: {
          media,
          fps,
          output_format,
          output_quality,
          apply_color_fix,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    let result = await response.json();
    console.log('[SeedVR2] Initial response:', result);

    // 如果还没完成，轮询等待
    if (result.status !== 'succeeded' && result.urls?.get) {
      console.log('[SeedVR2] Waiting for completion...');
      result = await waitForCompletion(result.urls.get, apiToken);
    }

    // 检查是否成功
    if (result.status !== 'succeeded' || !result.output) {
      throw new Error('No output returned');
    }

    // 扣除积分
    await consumeCredits({
      userId: user.id,
      credits: COST_CREDITS,
      scene: 'seedvr2-restore',
      description: 'SeedVR2 video restoration',
    });

    return respData({
      output: result.output,
      status: result.status,
    });
  } catch (e: any) {
    console.error('[SeedVR2] Error:', e);
    return respErr(e.message);
  }
}
