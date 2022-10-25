import IconMenu from './icon-vertical-ellipsis.svg';

import { Menu as BaseMenu, MenuButton, MenuItem, useMenuState } from 'ariakit/menu';

type MenuProps = { items: string[]; alignment: 'right' | 'center' };

export const Menu = ({ items }: MenuProps) => {
  const state = useMenuState();
  return (
    <>
      <MenuButton state={state} className="button">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IconMenu.src} alt="Toggle menu" />
      </MenuButton>
      <BaseMenu state={state} className="menu">
        {items.map((item) => (
          <MenuItem key={item} className="menu-item" onClick={() => alert(`${item}`)}>
            {item}
          </MenuItem>
        ))}
      </BaseMenu>
    </>
  );
};
