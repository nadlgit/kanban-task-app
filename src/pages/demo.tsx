import { BoardContextProvider } from 'webui/board';
import { BoardLayout } from 'webui/layout';
import type { NextPageWithLayout } from 'webui/shared';

const DemoPage: NextPageWithLayout = () => (
  <BoardContextProvider isDemo={true}>
    <BoardLayout />
  </BoardContextProvider>
);

export default DemoPage;
