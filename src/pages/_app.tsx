import 'webui/shared/styles/globals.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { ErrorFallback } from 'webui/misc';
import { AuthRouter } from 'webui/routes';
import { ThemeContextProvider } from 'webui/theme';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Frontend Mentor | Kanban task management web app</title>
      </Head>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <AuthContextProvider>
          <AuthRouter>
            <ThemeContextProvider>
              <Component {...pageProps} />
            </ThemeContextProvider>
          </AuthRouter>
        </AuthContextProvider>
      </ErrorBoundary>
    </>
  );
};

export default MyApp;
