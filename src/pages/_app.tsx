import 'webui/shared/styles/globals.css';

import Head from 'next/head';
import { DragDropContext } from 'react-beautiful-dnd';
import { ErrorBoundary } from 'react-error-boundary';

import { AuthContextProvider } from 'webui/auth';
import { Dependencies } from 'core/dependencies';
import { FirebaseAuthRepository } from 'infrastructure/auth';
import { DemoBoardRepository, FirebaseBoardRepository } from 'infrastructure/board';
import { ErrorFallback } from 'webui/misc';
import { UINotification, UINotificationContainer } from 'webui/notification';
import { AuthRouter } from 'webui/routes';
import { handleDragEnd } from 'webui/shared';
import type { NextAppPropsWithLayout } from 'webui/shared';
import { ThemeContextProvider } from 'webui/theme';

Dependencies.init({
  appNotification: new UINotification(),
  authRepository: new FirebaseAuthRepository(),
  boardRepository: new FirebaseBoardRepository(),
  demoRepository: new DemoBoardRepository(),
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
            <AuthRouter>
              <DragDropContext onDragEnd={handleDragEnd}>
                {getLayout(<Component {...pageProps} />)}
              </DragDropContext>
            </AuthRouter>
          </AuthContextProvider>
          <UINotificationContainer />
        </ThemeContextProvider>
      </ErrorBoundary>
    </>
  );
}
