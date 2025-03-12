import { json } from '@remix-run/node';
import type { ActionFunction } from '@remix-run/node';
import type { NetlifySiteInfo } from '~/types/netlify';

export const action: ActionFunction = async ({ request }) => {
  try {
    const { siteId, files, token, chatId } = await request.json();

    if (!token) {
      return json({ error: 'Not connected to Netlify' }, { status: 401 });
    }

    let targetSiteId = siteId;
    let siteInfo: NetlifySiteInfo | undefined;

    // Check if site exists
    if (targetSiteId) {
      const siteResponse = await fetch(`https://api.netlify.com/api/v1/sites/${targetSiteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (siteResponse.ok) {
        const existingSite = await siteResponse.json();
        siteInfo = {
          id: existingSite.id,
          name: existingSite.name,
          url: existingSite.url,
          chatId,
        };
      } else {
        targetSiteId = undefined;
      }
    }

    // Create new site if needed
    if (!targetSiteId) {
      const siteName = `bolt-diy-${chatId}-${Date.now()}`;
      siteInfo = await createNetlifySite(token, siteName, chatId);
      targetSiteId = siteInfo.id;
    }

    // Deploy files
    const deploymentResult = await deployToNetlify(token, targetSiteId, files);

    return json({ siteInfo, deployment: deploymentResult });
  } catch (error) {
    console.error('Deployment error:', error);
    return json({ error: 'Deployment failed' }, { status: 500 });
  }
};

async function createNetlifySite(token: string, siteName: string, chatId: string) {
  const response = await fetch('https://api.netlify.com/api/v1/sites', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: siteName,
      custom_domain: null,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create site');
  }

  const site = await response.json();

  return {
    id: site.id,
    name: site.name,
    url: site.url,
    chatId,
  };
}

async function deployToNetlify(_token: string, _siteId: string, _files: Record<string, string>) {
  // Implementation details...
}
