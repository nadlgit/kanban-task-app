import type { FallbackProps } from 'react-error-boundary';

export const ErrorFallback = ({ error }: FallbackProps) => (
  <div role="alert">
    <p>Apologies, something went wrong.</p>
    <code>{error?.message}</code>
  </div>
);
