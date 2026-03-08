import { describe, expect, it } from 'vitest';

import homepageMessages from '@/config/locale/messages/en/pages/index.json';

const metadata = homepageMessages.metadata;

describe('首页元数据测试', () => {
  it('应该使用 Video to Prompt 品牌标题', () => {
    expect(metadata.title).toContain('Video to Prompt');
    expect(metadata.title).not.toContain('SeedVR2');
  });

  it('标题长度应该不超过 60 个字符', () => {
    expect(metadata.title.length).toBeLessThanOrEqual(60);
  });

  it('描述应该围绕 video-to-prompt 工作流', () => {
    expect(metadata.description).toContain('video');
    expect(metadata.description).toContain('prompt');
  });

  it('关键词应该包含核心业务词', () => {
    expect(metadata.keywords).toContain('video to prompt');
    expect(metadata.keywords).toContain('prompt');
    expect(metadata.keywords).toContain('shot list');
  });
});
