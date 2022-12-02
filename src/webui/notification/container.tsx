import styles from './notification.module.css';

import { Toaster } from 'react-hot-toast';

export const UINotificationContainer = () => {
  return <Toaster toastOptions={{ className: styles.toast }} />;
};
