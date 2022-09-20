import { useRouter } from 'next/router';
import type { NextPage } from 'next';

const Board: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;
  return <div> {`Board "${id}"`}</div>;
};

export default Board;
