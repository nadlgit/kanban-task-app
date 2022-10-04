import 'webui/shared/styles/globals.css';

import type { AppProps } from 'next/app';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { ErrorFallback } from 'webui/misc';
import { AuthRouter } from 'webui/routes';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <AuthContextProvider>
        <AuthRouter>
          <Component {...pageProps} />
        </AuthRouter>
      </AuthContextProvider>
    </ErrorBoundary>
  );
};

export default MyApp;
