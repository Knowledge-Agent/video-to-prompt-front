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

    // Only allow HTTP/HTTPS URLs
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      return new Response('Only HTTP/HTTPS URLs are allowed', { status: 400 });
    }

    // Fetch the file
    const range = request.headers.get('range');
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'SeedVR2-Proxy/1.0',
        ...(range ? { Range: range } : {}),
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return new Response(
        `Failed to fetch file: ${response.status}${text ? `\n${text}` : ''}`,
        { status: response.status }
      );
    }

    // Get content type and filename
    const contentType =
      response.headers.get('content-type') || 'application/octet-stream';
    const contentDisposition = response.headers.get('content-disposition');

    // Extract filename from URL if not in headers
    let filename = 'download';
    if (contentDisposition) {
      const match = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
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
    const headers = new Headers();
    headers.set('Content-Type', contentType);
    headers.set('Content-Disposition', `attachment; filename="${filename}"`);

    const passthroughHeaders = [
      'content-length',
      'accept-ranges',
      'content-range',
      'cache-control',
      'etag',
      'last-modified',
    ];
    for (const key of passthroughHeaders) {
      const value = response.headers.get(key);
      if (value) headers.set(key, value);
    }

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response('Proxy error', { status: 500 });
  }
}
