import { Dependencies } from 'core/dependencies';

export function notifyInfo(msg: string) {
  Dependencies.getAppNotification().info(msg);
}

export function notifySuccess(msg?: string) {
  Dependencies.getAppNotification().success(msg ? msg : 'Success!');
}

export function notifyWarning(msg: string) {
  Dependencies.getAppNotification().warning(msg);
}

export function notifyError(msg: string) {
  Dependencies.getAppNotification().error(msg);
}
