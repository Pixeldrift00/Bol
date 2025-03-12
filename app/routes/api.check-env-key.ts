import type { LoaderFunction } from '@remix-run/node';
import { providerBaseUrlEnvKeys } from '~/utils/constants';

export const loader: LoaderFunction = async ({ context, request }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get('provider');

  if (!provider || !providerBaseUrlEnvKeys[provider].apiTokenKey) {
    return Response.json({ isSet: false });
  }

  const envVarName = providerBaseUrlEnvKeys[provider].apiTokenKey;
  const netlifyContext = context as { env: Record<string, string> };

  // Check both process.env and Netlify context
  const isSet = !!(netlifyContext.env[envVarName] || process.env[envVarName]);

  return Response.json({ isSet });
};
