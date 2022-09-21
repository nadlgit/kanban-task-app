import type { NextPage } from 'next';

import { Navigate, BOARDS_ROUTE } from 'webui/routes';

const HomePage: NextPage = () => <Navigate route={BOARDS_ROUTE} />;

export default HomePage;
