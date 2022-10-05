import type { NextPage } from 'next';

import { Register } from 'webui/auth';
import { BaseLayout } from 'webui/layout';

const RegisterPage: NextPage = () => (
  <BaseLayout>
    <Register />
  </BaseLayout>
);

export default RegisterPage;
