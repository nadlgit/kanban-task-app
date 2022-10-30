import styles from './menu.module.css';
import IconMenu from './icon-vertical-ellipsis.svg';

import { Menu as BaseMenu, MenuButton, MenuItem, useMenuState } from 'ariakit/menu';

type MenuItemInfo = {
  label: string;
  onClick: () => void;
  variant?: 'destructive';
  disabled?: boolean;
};
type MenuProps = { items: MenuItemInfo[] };

export const Menu = ({ items }: MenuProps) => {
  const state = useMenuState({ gutter: 16 });
  return (
    <>
      <MenuButton state={state} className={styles.button}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IconMenu.src} alt="Toggle menu" />
      </MenuButton>
      <BaseMenu state={state} className={styles.menu}>
        {items.map((item) => (
          <MenuItem
            key={item.label}
            onClick={item.onClick}
            className={`${styles.item} ${item?.variant ? styles[item.variant] : ''}`}
            disabled={item?.disabled}
          >
            {item.label}
          </MenuItem>
        ))}
      </BaseMenu>
    </>
  );
};
