import IconAdd from './icon-add-task-mobile.svg';

import { Button } from 'webui/shared';

type AddTaskBtnProps = { isMobile: boolean };

export const AddTaskBtn = ({ isMobile }: AddTaskBtnProps) => {
  return (
    <Button variant="primary-s" fullWidth={false}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {isMobile ? <img src={IconAdd.src} alt="Add new task" /> : '+ Add New Task'}
    </Button>
  );
};
