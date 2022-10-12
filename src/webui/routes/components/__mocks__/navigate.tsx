import type { Navigate as OrigNavigate } from '../navigate';

export const Navigate: typeof OrigNavigate = ({ to }) => (
  <div data-testid="mock-navigate-component">{`Redirected to: ${to}`}</div>
);
