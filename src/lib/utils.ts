import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { env } from '@/config/env';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isServer() {
  return typeof window === 'undefined';
}

export function isClient() {
  return !isServer();
}

export async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getURL(path: string = '') {
  // Check if NEXT_PUBLIC_SITE_URL is set and non-empty. Set this to your site URL in production env.
  let url =
    env.NEXT_PUBLIC_SITE_URL && env.NEXT_PUBLIC_SITE_URL.trim() !== ''
      ? env.NEXT_PUBLIC_SITE_URL
      : // If not set, check for NEXT_PUBLIC_VERCEL_URL, which is automatically set by Vercel.
        env.NEXT_PUBLIC_VERCEL_URL && env.NEXT_PUBLIC_VERCEL_URL.trim() !== ''
        ? env.NEXT_PUBLIC_VERCEL_URL
        : // If neither is set, default to localhost for local development.
          `http://localhost:${process.env.PORT ?? 3000}`;

  // Trim the URL and remove trailing slash if exists.
  url = url.replace(/\/+$/, '');
  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}`;

  const fullURL = new URL(path, url).toString();
  return fullURL.endsWith('/') ? fullURL.slice(0, -1) : fullURL;
}
