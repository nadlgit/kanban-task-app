import styles from './board-top-menu.module.css';

import { AddTaskBtn, useBoardList } from 'webui/board';
import { Menu, useIsMobile } from 'webui/shared';

export const BoardTopMenu = () => {
  const { activeBoardId } = useBoardList();
  const isMobile = useIsMobile();
  return (
    <div className={styles.container}>
      <AddTaskBtn isMobile={isMobile} />
      <Menu items={['Edit Board', 'Delete Board']} />
    </div>
  );
};
