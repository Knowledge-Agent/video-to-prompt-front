/**
 * Anchor Link Component (锚点链接组件)
 * 支持平滑滚动到页面内锚点，同时更新 URL
 * pos: src/shared/blocks/common/anchor-link.tsx
 */
'use client';

import { useRouter } from 'next/navigation';
import { MouseEvent, ReactNode, useCallback } from 'react';

interface AnchorLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

/**
 * 锚点链接组件
 * 点击后平滑滚动到对应区块，并更新 URL 中的锚点
 * 支持同页面锚点（如 #video-upscaler）和带路径的锚点（如 /#video-upscaler）
 */
export function AnchorLink({ href, children, className, onClick }: AnchorLinkProps) {
  const router = useRouter();

  const handleClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    // 检查是否是锚点链接
    const isAnchorLink = href.includes('#');
    
    if (!isAnchorLink) {
      // 非锚点链接，使用默认行为
      return;
    }

    e.preventDefault();

    // 解析锚点
    const hashIndex = href.indexOf('#');
    const path = href.slice(0, hashIndex) || '/';
    const hash = href.slice(hashIndex + 1);

    // 检查是否是当前页面的锚点
    const currentPath = window.location.pathname;
    const isCurrentPage = path === '/' || path === '' || currentPath === path || currentPath.endsWith(path);

    if (isCurrentPage && hash) {
      // 同页面锚点，直接滚动
      const element = document.getElementById(hash);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        // 更新 URL 中的锚点，不刷新页面
        window.history.pushState(null, '', `#${hash}`);
      }
    } else {
      // 跨页面锚点，先导航再滚动
      router.push(href);
    }

    // 调用外部传入的 onClick 回调
    onClick?.();
  }, [href, router, onClick]);

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
