import 'webui/shared/styles/globals.css';

import type { AppProps } from 'next/app';
import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { Dependencies } from 'core/dependencies';
// import { FirebaseAuthRepository } from 'infrastructure/auth';
import { ErrorFallback } from 'webui/misc';
import { AuthRouter } from 'webui/routes';
import { ThemeContextProvider } from 'webui/theme';

// Dependencies.init({ authRepository: new FirebaseAuthRepository() });

import { FakeAuthRepository } from 'infrastructure/auth';
import { FakeBoardRepository } from 'infrastructure/board';
Dependencies.init({
  authRepository: new FakeAuthRepository(),
  boardRepository: new FakeBoardRepository(),
});

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Frontend Mentor | Kanban task management web app</title>
      </Head>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeContextProvider>
          <AuthContextProvider>
            <AuthRouter>
              <Component {...pageProps} />
            </AuthRouter>
          </AuthContextProvider>
        </ThemeContextProvider>
      </ErrorBoundary>
    </>
  );
};

export default MyApp;
