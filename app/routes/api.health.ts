import type { LoaderFunction } from '@remix-run/node';

export const loader = async ({ request: _request }: Parameters<LoaderFunction>[0]) => {
  // Return a simple 200 OK response with some basic health information
  return new Response(
    JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );
};
