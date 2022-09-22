import type { NextPage } from 'next';

import { Navigate, BOARDS_ROUTE } from 'webui/routes';

const BoardIndexPage: NextPage = () => {
  return <Navigate to={`${BOARDS_ROUTE}/tmp_first_or_new`} />;
};

export default BoardIndexPage;
