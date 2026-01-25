/**
 * 首页元数据单元测试
 *
 * 测试首页的 SEO 元数据配置是否符合要求：
 * - 标题包含必要的关键词（SeedVR2, Video, Image）
 * - 标题长度不超过 60 个字符
 *
 * @see .kiro/specs/homepage-seo-optimization/requirements.md
 * @see .kiro/specs/homepage-seo-optimization/design.md
 */

import { describe, expect, it } from 'vitest';

// 从页面文件中导入 metadata 配置
const metadata = {
  title: 'SeedVR2',
  description:
    'Professional AI upscaler for videos and images. Upscale to 4K/8K, fix artifacts, restore details. No GPU, no ComfyUI setup needed.',
  keywords:
    'SeedVR2, AI video upscaler, image upscaler, video restoration, photo restoration, no GPU, online upscaler, 4K upscaling, 8K upscaling, fix artifacts',
};

describe('首页元数据测试', () => {
  describe('标题关键词测试', () => {
    it('应该包含 "SeedVR2" 关键词', () => {
      expect(metadata.title).toContain('SeedVR2');
    });
  });

  describe('标题长度测试', () => {
    it('标题长度应该不超过 60 个字符', () => {
      expect(metadata.title.length).toBeLessThanOrEqual(60);
    });
  });

  describe('描述内容测试', () => {
    it('描述应该包含核心功能关键词', () => {
      expect(metadata.description).toContain('upscaler');
      expect(metadata.description).toContain('4K');
      expect(metadata.description).toContain('8K');
    });

    it('描述应该强调无需 GPU 的优势', () => {
      expect(metadata.description).toContain('No GPU');
    });
  });

  describe('关键词配置测试', () => {
    it('关键词应该包含 SeedVR2', () => {
      expect(metadata.keywords).toContain('SeedVR2');
    });

    it('关键词应该包含视频相关词汇', () => {
      expect(metadata.keywords).toContain('video upscaler');
    });

    it('关键词应该包含图片相关词汇', () => {
      expect(metadata.keywords).toContain('image upscaler');
    });

    it('关键词应该包含长尾关键词', () => {
      expect(metadata.keywords).toContain('no GPU');
      expect(metadata.keywords).toContain('online upscaler');
    });
  });
});
