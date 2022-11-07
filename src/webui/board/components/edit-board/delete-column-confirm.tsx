import { ConfirmDelete } from '../confirm-delete';

export type DeleteColumnConfirmProps = {
  isOpen: boolean;
  close: () => void;
  columnName: string;
  onDelete: () => void;
};

export const DeleteColumnConfirm = ({
  isOpen,
  close,
  columnName,
  onDelete,
}: DeleteColumnConfirmProps) => {
  const confirmProps = {
    isOpen,
    title: 'Delete this column?',
    message:
      `Are you sure you want to delete the ‘${columnName}’ column` +
      ' and all of its tasks? This action cannot be undone.',
    onClose: async (shouldDelete: boolean) => {
      if (shouldDelete) {
        onDelete();
      }
      close();
    },
  };
  return <ConfirmDelete {...confirmProps} />;
};
