import { createRequestHandler } from '@remix-run/netlify';
import * as build from '@remix-run/dev/server-build';

/*
 * By default, Netlify Function Handlers automatically include
 * the serverless function's event and context as arguments.
 */
export const handler = createRequestHandler({
  build,
  mode: process.env.NODE_ENV,
  getLoadContext(event) {
    return {
      env: process.env,
      netlify: {
        context: event.context,
        functionName: event.context.functionName,
      },
    };
  },
});