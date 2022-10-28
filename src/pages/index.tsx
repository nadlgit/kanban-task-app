import { Navigate, BOARDS_ROUTE } from 'webui/routes';
import type { NextPageWithLayout } from 'webui/shared';

const HomePage: NextPageWithLayout = () => <Navigate to={BOARDS_ROUTE} />;

export default HomePage;
