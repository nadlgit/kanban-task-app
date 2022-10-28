import { Login } from 'webui/auth';
import { BaseLayout } from 'webui/layout';
import { setNextPageLayout } from 'webui/shared';
import type { NextPageWithLayout } from 'webui/shared';

const LoginPage: NextPageWithLayout = () => <Login />;

LoginPage.getLayout = setNextPageLayout(BaseLayout);

export default LoginPage;
