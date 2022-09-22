import 'styles/globals.css';

import type { AppProps } from 'next/app';

import { AuthContextProvider, AuthRouter } from 'webui/auth';

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
