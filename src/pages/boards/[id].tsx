import { useRouter } from 'next/router';
import type { NextPage } from 'next';

import { Logout } from 'webui/auth';

const BoardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return (
    <>
      <div> {`Board "${id}"`}</div>
      <Logout />
    </>
  );
};

export default BoardPage;
