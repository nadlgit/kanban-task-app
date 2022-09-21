import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const BoardPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return <div> {`Board "${id}"`}</div>;
};

export default BoardPage;
