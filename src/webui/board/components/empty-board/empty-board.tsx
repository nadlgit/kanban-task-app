import styles from './empty-board.module.css';

import { Button } from 'webui/shared';

type EmptyBoardProps = { addNewColumn: () => void };

export const EmptyBoard = ({ addNewColumn }: EmptyBoardProps) => {
  return (
    <div className={styles.container}>
      <p className={styles.msg}>This board is empty. Create a new column to get started.</p>
      <Button variant="primary-l" fullWidth={false} onClick={addNewColumn}>
        + Add New Column
      </Button>
    </div>
  );
};
