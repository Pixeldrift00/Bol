import type { LoaderFunction } from '@remix-run/node';
import { providerBaseUrlEnvKeys } from '~/utils/constants';

export const loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (!provider || !providerBaseUrlEnvKeys[provider].apiTokenKey) {
    return Response.json({ isSet: false });
  }

  const envVarName = providerBaseUrlEnvKeys[provider].apiTokenKey;

  // Update to use Netlify context instead of Cloudflare
  const isSet = !!(process.env[envVarName] || (context as any)?.[envVarName]);

  return Response.json({ isSet });
};
