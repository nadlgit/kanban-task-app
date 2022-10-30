import styles from './board-top-menu.module.css';

import { AddTaskBtn, useActiveBoard } from 'webui/board';
import { Menu, useIsMobile } from 'webui/shared';

export const BoardTopMenu = () => {
  const isMobile = useIsMobile();
  const { loading, board } = useActiveBoard();
  return (
    <div className={styles.container}>
      <AddTaskBtn isMobile={isMobile} />
      <Menu
        items={[
          { label: 'Edit Board', onClick: () => alert(`Edit active board`) },
          {
            label: 'Delete Board',
            onClick: () => alert(`Delete active board`),
            variant: 'destructive',
          },
        ]}
      />
    </div>
  );
};
