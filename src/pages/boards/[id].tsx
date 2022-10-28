import { useRouter } from 'next/router';

import { BoardContent } from 'webui/board';
import { BoardLayout } from 'webui/layout';
import { setNextPageLayout } from 'webui/shared';
import type { NextPageWithLayout } from 'webui/shared';

const BoardPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <div> {`Board "${id}"`}</div>
      <BoardContent />
    </>
  );
};

BoardPage.getLayout = setNextPageLayout(BoardLayout);

export default BoardPage;
