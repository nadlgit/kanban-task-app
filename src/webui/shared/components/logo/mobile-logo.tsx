import Logo from './logo-mobile.svg';

export const MobileLogo = () => (
  <span>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={Logo.src} alt="Application logo" />
  </span>
);
