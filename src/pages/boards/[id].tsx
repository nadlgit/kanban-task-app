import type { NextPage } from 'next';
import { useRouter } from 'next/router';

import { BoardContent } from 'webui/board';
import { BoardLayout } from 'webui/layout';

const BoardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <BoardLayout>
      <div> {`Board "${id}"`}</div>
      <BoardContent />
    </BoardLayout>
  );
};

export default BoardPage;
