import type { LoaderFunction, MetaFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { ClientOnly } from 'remix-utils/client-only';
import { BaseChat } from '~/components/chat/BaseChat';
import { GitUrlImport } from '~/components/git/GitUrlImport.client';
import { Header } from '~/components/header/Header';
import BackgroundRays from '~/components/ui/BackgroundRays';

export const loader: LoaderFunction = async ({ params }) => {
  // If you need to return the URL parameter
  return json({ url: params.url });
};

export const meta: MetaFunction = () => {
  return {
    title: 'Git Operations',
    description: 'Manage your Git repository',
  };
};

export default function Index() {
  return (
    <div className="flex flex-col h-full w-full bg-bolt-elements-background-depth-1">
      <BackgroundRays />
      <Header />
      <ClientOnly fallback={<BaseChat />}>{() => <GitUrlImport />}</ClientOnly>
    </div>
  );
}
