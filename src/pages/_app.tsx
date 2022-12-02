import 'webui/shared/styles/globals.css';

import Head from 'next/head';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { Dependencies } from 'core/dependencies';
import { FakeAuthRepository, FirebaseAuthRepository } from 'infrastructure/auth';
import { FakeBoardRepository, FirebaseBoardRepository } from 'infrastructure/board';
import { ErrorFallback } from 'webui/misc';
import { UINotification, UINotificationContainer } from 'webui/notification';
import { AuthRouter } from 'webui/routes';
import type { NextAppPropsWithLayout } from 'webui/shared';
import { ThemeContextProvider } from 'webui/theme';

Dependencies.init({
  appNotification: new UINotification(),
  authRepository: process.env.NEXT_PUBLIC_FAKE_REPOSITORIES
    ? new FakeAuthRepository()
    : new FirebaseAuthRepository(),
  boardRepository: process.env.NEXT_PUBLIC_FAKE_REPOSITORIES
    ? new FakeBoardRepository()
    : new FirebaseBoardRepository(),
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
          <UINotificationContainer />
        </ThemeContextProvider>
      </ErrorBoundary>
    </>
  );
}
