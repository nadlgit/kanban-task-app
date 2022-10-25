import { useMediaQuery } from './use-media-query';

export const useIsMobile = () => {
  const breakpoint = '40rem';
  return !useMediaQuery(`(min-width: ${breakpoint})`);
};
