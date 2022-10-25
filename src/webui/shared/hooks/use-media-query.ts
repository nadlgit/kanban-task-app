import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (query) {
      const mql = window.matchMedia(query);
      setMatches(mql.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setMatches(e.matches);
      };
      mql.addEventListener('change', handleChange);
      return () => {
        mql.removeEventListener('change', handleChange);
      };
    }
  }, [query]);

  return matches;
};
