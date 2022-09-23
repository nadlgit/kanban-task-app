import 'styles/globals.css';

import type { AppProps } from 'next/app';

import { AuthContextProvider } from 'webui/auth';
import { AuthRouter } from 'webui/routes';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AuthContextProvider>
      <AuthRouter>
        <Component {...pageProps} />
      </AuthRouter>
    </AuthContextProvider>
  );
};

export default MyApp;
