import styles from './menu.module.css';
import IconMenu from './icon-vertical-ellipsis.svg';

import { Menu as BaseMenu, MenuButton, MenuItem, useMenuState } from 'ariakit/menu';
import { useRef } from 'react';

type MenuItemInfo = {
  label: string;
  onClick: () => void;
  variant?: 'destructive';
  disabled?: boolean;
};
type MenuProps = { items: MenuItemInfo[] };

export const Menu = ({ items }: MenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const state = useMenuState({
    gutter: 16,
    getAnchorRect: (anchor) => {
      // Position menu centered relative to anchor
      if (!anchor) {
        return null;
      }
      const anchorRect = anchor.getBoundingClientRect();
      const triggerRect = menuRef.current?.getBoundingClientRect();
      const width = triggerRect?.width ?? anchorRect.width;
      return {
        x: anchorRect.x - width / 2,
        y: anchorRect.y,
        width,
        height: anchorRect.height,
      };
    },
  });

  return (
    <>
      <MenuButton state={state} className={styles.button}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IconMenu.src} alt="Toggle menu" />
      </MenuButton>
      <BaseMenu state={state} className={styles.menu} ref={menuRef}>
        {items.map((item) => {
          const cssClasses = [styles.item];
          item?.variant && cssClasses.push(styles[item.variant]);
          return (
            <MenuItem
              key={item.label}
              onClick={item.onClick}
              className={cssClasses.join(' ')}
              disabled={item?.disabled}
            >
              {item.label}
            </MenuItem>
          );
        })}
      </BaseMenu>
    </>
  );
};
