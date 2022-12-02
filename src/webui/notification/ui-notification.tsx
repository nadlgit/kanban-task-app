import IconWarning from './icon-warning.png';

import { toast } from 'react-hot-toast';

import type { AppNotification } from 'core/ports';

export class UINotification implements AppNotification {
  info(msg: string) {
    toast(msg);
  }
  success(msg: string) {
    toast.success(msg);
  }
  warning(msg: string) {
    const Icon = () => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={IconWarning.src}
        alt=""
        width={20}
        height={20}
        style={{ backgroundColor: 'white', borderRadius: '100%' }}
      />
    );
    toast.error(msg, { icon: <Icon /> });
  }
  error(msg: string) {
    toast.error(msg);
  }
}
