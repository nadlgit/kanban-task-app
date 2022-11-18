import type { ComponentProps } from 'react';

import { AddTaskForm } from './add-task-form';
import type { BoardEntity } from 'core/entities';
import { Modal, ModalHeading } from 'webui/shared';

type AddTaskProps = { isOpen: boolean; close: () => void; board: BoardEntity };

export const AddTask = ({ isOpen, close, board }: AddTaskProps) => {
  const onSubmit: ComponentProps<typeof AddTaskForm>['onSubmit'] = async () => {
    //todo
    close();
  };

  return (
    <Modal isOpen={isOpen} onClose={close}>
      <ModalHeading>Add New Task</ModalHeading>
      <AddTaskForm
        statusList={board.columns.map(({ id, name }) => ({ value: id, label: name }))}
        onSubmit={onSubmit}
      />
    </Modal>
  );
};
