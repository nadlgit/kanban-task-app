import type { Navigate as OrigNavigate } from '../navigate';

export const Navigate: jest.MockedFunction<typeof OrigNavigate> = jest.fn(({ to }) => (
  <div data-testid="mock-navigate-component">{`Redirected to: ${to}`}</div>
));
