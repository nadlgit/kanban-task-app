import type { Modal as OrigModal } from '../modal';

export const Modal: typeof OrigModal = ({ children }) => <div>{children}</div>;
