import { useEffect } from 'react';
import { useRouter } from 'next/router';

type NavigateProps = { to: string };

export const Navigate = ({ to }: NavigateProps) => {
  const router = useRouter();
  useEffect(() => {
    router.push(to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to]);
  return <div>Redirecting...</div>;
};
