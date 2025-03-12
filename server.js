import { createRequestHandler } from '@remix-run/netlify';
import * as build from './build/server/index.js';

export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(event) {
    // Normalize path to handle @ segments
    const url = new URL(event.rawUrl);
    const path = url.pathname;
    
    return {
      env: process.env,
      netlify: event.context,
      path: event.path,
    };
  },
});