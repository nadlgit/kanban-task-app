import { useEffect } from 'react';
import { useRouter } from 'next/router';

type NavigateProps = { route: string };

export const Navigate = ({ route }: NavigateProps) => {
  const router = useRouter();

  useEffect(() => {
    router.push(route);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div>Redirecting...</div>;
};
