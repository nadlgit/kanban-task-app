import { Navigate, BOARDS_ROUTE } from 'webui/routes';
import type { NextPageWithLayout } from 'webui/shared';

const BoardIndexPage: NextPageWithLayout = () => {
  return <Navigate to={`${BOARDS_ROUTE}/tmp_first_or_new`} />;
};

export default BoardIndexPage;
