import styles from './column.module.css';

type AddColumnProps = {
  onTrigger: () => void;
};

export const AddColumn = ({ onTrigger }: AddColumnProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.title}>&nbsp;</div>
      <button onClick={onTrigger} className={styles.newcolumn}>
        + New Column
      </button>
    </div>
  );
};
