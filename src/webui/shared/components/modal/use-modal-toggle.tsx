import { useCallback, useState } from 'react';

export const useModalToggle = (isOpenDefault?: boolean) => {
  const [isModalOpen, setIsModalOpen] = useState(isOpenDefault ?? false);
  const openModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);
  return { isModalOpen, openModal, closeModal };
};
