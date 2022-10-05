import type { NextPage } from 'next';

import { Login } from 'webui/auth';
import { BaseLayout } from 'webui/layout';

const LoginPage: NextPage = () => (
  <BaseLayout>
    <Login />
  </BaseLayout>
);

export default LoginPage;
