import styles from './board-list-nav-button.module.css';
import IconBoard from './icon-board.svg';

import { Icon } from 'webui/shared';

type BoardListNavButtonProps = {
  label: string;
  onClick: () => void;
  isActive?: boolean;
  isCreate?: boolean;
};

export const BoardListNavButton = ({
  label,
  onClick,
  isActive,
  isCreate,
}: BoardListNavButtonProps) => {
  const cssClasses = [styles.button];
  isActive && cssClasses.push(styles.active);
  isCreate && cssClasses.push(styles.create);
  return (
    <button onClick={onClick} className={cssClasses.join(' ')}>
      <Icon imgSrc={IconBoard.src} imgAccessibleName="" className={styles.icon} />
      <span className={styles.label}>{label}</span>
    </button>
  );
};
