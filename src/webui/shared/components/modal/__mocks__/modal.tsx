import type { Modal as OrigModal } from '../modal';

export const Modal: typeof OrigModal = ({ children, onClose }) => (
  <div>
    {children}
    <button onClick={onClose} data-testid="mock-close-modal-btn"></button>
  </div>
);
