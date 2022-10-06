import LogoBlack from './logo-dark.svg';
import LogoWhite from './logo-light.svg';

import { useTheme } from 'webui/theme';

export const ThemedLogo = () => {
  const { theme } = useTheme();
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={theme === 'light' ? LogoBlack.src : LogoWhite.src} alt="Application logo" />;
};
