import { BoardContextProvider } from 'webui/board';
import { BoardLayout } from 'webui/layout';
import type { NextPageWithLayout } from 'webui/shared';

const BoardPage: NextPageWithLayout = () => (
  <BoardContextProvider isDemo={false}>
    <BoardLayout />
  </BoardContextProvider>
);

export default BoardPage;
