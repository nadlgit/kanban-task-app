import styles from './board-list-nav-item.module.css';
import IconBoard from './icon-board.svg';

import { Icon } from 'webui/shared';

type BoardListNavItemProps = {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  isCreate?: boolean;
};

export const BoardListNavItem = ({ label, onClick, isActive, isCreate }: BoardListNavItemProps) => {
  const cssClasses = [styles.button];
  isActive && cssClasses.push(styles.active);
  isCreate && cssClasses.push(styles.create);
  return (
    <li aria-current={isActive}>
      <button onClick={onClick} className={cssClasses.join(' ')}>
        <Icon imgSrc={IconBoard.src} imgAccessibleName="" className={styles.icon} />
        <span className={styles.label}>{label}</span>
      </button>
    </li>
  );
};
