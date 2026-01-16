/**
 * Anchor Scroll Handler Component (锚点滚动处理组件)
 * 在页面加载时检查 URL 中的锚点，自动滚动到对应区块
 * pos: src/shared/blocks/common/anchor-scroll-handler.tsx
 */
'use client';

import { useEffect } from 'react';

/**
 * 处理直接访问带锚点 URL 的情况
 * 在页面加载完成后，检查 URL 中的锚点并平滑滚动到对应区块
 */
export function AnchorScrollHandler() {
  useEffect(() => {
    // 获取 URL 中的锚点
    const hash = window.location.hash;
    
    if (hash) {
      // 移除 # 符号获取元素 ID
      const elementId = hash.slice(1);
      
      // 延迟执行以确保页面完全渲染
      const scrollToElement = () => {
        const element = document.getElementById(elementId);
        if (element) {
          // 平滑滚动到目标元素
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      };

      // 使用 requestAnimationFrame 确保 DOM 已完全渲染
      // 再加一个小延迟以确保所有动态内容加载完成
      requestAnimationFrame(() => {
        setTimeout(scrollToElement, 100);
      });
    }
  }, []);

  // 此组件不渲染任何内容
  return null;
}
