import styles from './board-actions.module.css';
import IconAdd from './icon-add-task-mobile.svg';

import { Button, Menu } from 'webui/shared';

type BoardActionsProps = { isMobile: boolean };

export const BoardActions = ({ isMobile }: BoardActionsProps) => {
  return (
    <div className={styles.container}>
      <Button variant="primary-s" fullWidth={false}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {isMobile ? <img src={IconAdd.src} alt="Add new task" /> : '+ Add New Task'}
      </Button>
      <Menu items={['Edit Board', 'Delete Board']} alignment="right" />
    </div>
  );
};
