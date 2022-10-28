import type { NextPage } from 'next';
import type { AppProps } from 'next/app';
import type { ElementType, ReactElement, ReactNode } from 'react';

// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type NextAppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export function setNextPageLayout(PageLayout: ElementType) {
  return function getLayout(page: ReactElement) {
    return <PageLayout>{page}</PageLayout>;
  };
}
