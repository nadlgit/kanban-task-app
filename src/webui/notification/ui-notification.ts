import type { AppNotification } from 'core/ports';

export class UINotification implements AppNotification {
  info(msg: string) {
    window.alert(`INFO: ${msg}`);
  }
  success(msg: string) {
    window.alert(`SUCCESS: ${msg}`);
  }
  warning(msg: string) {
    window.alert(`WARNING: ${msg}`);
  }
  error(msg: string) {
    window.alert(`ERROR: ${msg}`);
  }
}
