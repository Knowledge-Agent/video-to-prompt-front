/**
 * File Proxy API
 * Proxies file downloads to avoid CORS issues
 * pos: src/app/api/proxy/file/route.ts
 */

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = request.nextUrl.searchParams.get('url');
    
    if (!url) {
      return new Response('Missing url parameter', { status: 400 });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return new Response('Invalid URL', { status: 400 });
    }

    // Only allow HTTPS URLs
    if (parsedUrl.protocol !== 'https:') {
      return new Response('Only HTTPS URLs are allowed', { status: 400 });
    }

    // Fetch the file
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SeedVR2-Proxy/1.0',
      },
    });

    if (!response.ok) {
      return new Response(`Failed to fetch file: ${response.status}`, { status: response.status });
    }

    // Get content type and filename
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');
    
    // Extract filename from URL if not in headers
    let filename = 'download';
    if (contentDisposition) {
      const match = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match) {
        filename = match[1].replace(/['"]/g, '');
      }
    } else {
      const pathParts = parsedUrl.pathname.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      if (lastPart) {
        filename = decodeURIComponent(lastPart);
      }
    }

    // Stream the response
    const headers = new Headers({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    // Add content length if available
    const contentLength = response.headers.get('content-length');
    if (contentLength) {
      headers.set('Content-Length', contentLength);
    }

    return new Response(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response('Proxy error', { status: 500 });
  }
}
