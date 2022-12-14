import styles from './dropdown.module.css';
import IconSelect from './icon-chevron-down.svg';

import { Select, SelectItem, SelectLabel, SelectPopover, useSelectState } from 'ariakit/select';

type DropdownProps = {
  label: string;
  items: { value: string; label?: string }[];
  name?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  autoFocus?: boolean;
};

export const Dropdown = ({
  label,
  items,
  name,
  onChange,
  defaultValue,
  autoFocus = false,
}: DropdownProps) => {
  const state = useSelectState({ setValue: onChange, defaultValue, gutter: 8 });
  return (
    <div className={styles.base}>
      <SelectLabel state={state} className={styles.label}>
        {label}
      </SelectLabel>
      <Select state={state} name={name} className={styles.trigger} autoFocus={autoFocus}>
        {items.find(({ value }) => value === state.value)?.label}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IconSelect.src} alt="" />
      </Select>
      <SelectPopover state={state} className={styles.menu}>
        {items.map(({ value, label }) => (
          <SelectItem key={value} value={value} className={styles.option}>
            {label ?? value}
          </SelectItem>
        ))}
      </SelectPopover>
    </div>
  );
};
