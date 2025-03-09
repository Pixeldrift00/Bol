import { WebContainer } from '@webcontainer/api';
import { WORK_DIR_NAME } from '~/utils/constants';
import { cleanStackTrace } from '~/utils/stacktrace';

interface WebContainerContext {
  loaded: boolean;
}

export const webcontainerContext: WebContainerContext = import.meta.hot?.data.webcontainerContext ?? {
  loaded: false,
};

if (import.meta.hot) {
  import.meta.hot.data.webcontainerContext = webcontainerContext;
}

export let webcontainer: Promise<WebContainer> = new Promise(() => {
  // noop for ssr
});

if (!import.meta.env.SSR) {
  webcontainer =
    import.meta.hot?.data.webcontainer ??
    Promise.resolve()
      .then(() => {
        console.log('Attempting to boot WebContainer...');
        // Add a timeout to prevent hanging forever
        return Promise.race([
          WebContainer.boot({
            coep: 'credentialless',
            workdirName: WORK_DIR_NAME,
            forwardPreviewErrors: true, // Enable error forwarding from iframes
          }),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('WebContainer boot timeout')), 10000);
          })
        ]);
      })
      .catch(error => {
        console.error('Failed to boot WebContainer:', error);
        // Force the app to continue loading even if WebContainer fails
        document.dispatchEvent(new CustomEvent('webcontainer-failed'));
        
        // Create a fallback container
        return {
          mount: () => Promise.resolve(),
          spawn: () => ({ exit: Promise.resolve(0), output: { pipeTo: () => {} } }),
          on: () => {},
          fs: {
            readFile: () => Promise.resolve(new Uint8Array()),
            writeFile: () => Promise.resolve(),
            readdir: () => Promise.resolve([]),
            mkdir: () => Promise.resolve(),
          },
        } as unknown as WebContainer;
      })
      .then(async (webcontainer) => {
        webcontainerContext.loaded = true;
        console.log('WebContainer booted successfully!');

        try {
          const { workbenchStore } = await import('~/lib/stores/workbench');

          // Listen for preview errors
          webcontainer.on('preview-message', (message) => {
            console.log('WebContainer preview message:', message);

            // Handle both uncaught exceptions and unhandled promise rejections
            if (message.type === 'PREVIEW_UNCAUGHT_EXCEPTION' || message.type === 'PREVIEW_UNHANDLED_REJECTION') {
              const isPromise = message.type === 'PREVIEW_UNHANDLED_REJECTION';
              workbenchStore.actionAlert.set({
                type: 'preview',
                title: isPromise ? 'Unhandled Promise Rejection' : 'Uncaught Exception',
                description: message.message,
                content: `Error occurred at ${message.pathname}${message.search}${message.hash}\nPort: ${message.port}\n\nStack trace:\n${cleanStackTrace(message.stack || '')}`,
                source: 'preview',
              });
            }
          });
        } catch (error) {
          console.error('Error setting up WebContainer event handlers:', error);
        }

        return webcontainer;
      });

  if (import.meta.hot) {
    import.meta.hot.data.webcontainer = webcontainer;
  }
}
