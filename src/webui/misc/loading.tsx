import styles from './loading.module.css';

type LoadingProps = { standalone?: boolean };

export const Loading = ({ standalone = false }: LoadingProps) =>
  standalone ? (
    <main className={styles.container}>
      <LoadingComponent />
    </main>
  ) : (
    <LoadingComponent />
  );

const LoadingComponent = () => (
  <div role="status" className={styles.component}>
    <p>Loading, please wait...</p>
    <div aria-hidden className={styles.spinner} />
  </div>
);
