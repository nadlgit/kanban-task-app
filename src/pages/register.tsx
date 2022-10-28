import { Register } from 'webui/auth';
import { BaseLayout } from 'webui/layout';
import { setNextPageLayout } from 'webui/shared';
import type { NextPageWithLayout } from 'webui/shared';

const RegisterPage: NextPageWithLayout = () => <Register />;

RegisterPage.getLayout = setNextPageLayout(BaseLayout);

export default RegisterPage;
