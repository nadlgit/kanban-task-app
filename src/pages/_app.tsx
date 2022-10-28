import 'webui/shared/styles/globals.css';

import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { Dependencies } from 'core/dependencies';
// import { FirebaseAuthRepository } from 'infrastructure/auth';
import { FakeAuthRepository } from 'infrastructure/auth';
import { FakeBoardRepository } from 'infrastructure/board';
import { ErrorFallback } from 'webui/misc';
import { UINotification } from 'webui/notification';
import { AuthRouter } from 'webui/routes';
import type { NextAppPropsWithLayout } from 'webui/shared';
import { ThemeContextProvider } from 'webui/theme';

Dependencies.init({
  appNotification: new UINotification(),
  // authRepository: new FirebaseAuthRepository(),
  authRepository: new FakeAuthRepository(),
  boardRepository: new FakeBoardRepository(),
});

export default function MyApp({ Component, pageProps }: NextAppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <Head>
        <title>Frontend Mentor | Kanban task management web app</title>
      </Head>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeContextProvider>
          <AuthContextProvider>
            <AuthRouter>{getLayout(<Component {...pageProps} />)}</AuthRouter>
          </AuthContextProvider>
        </ThemeContextProvider>
      </ErrorBoundary>
    </>
  );
}
