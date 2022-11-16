import styles from './dropdown.module.css';
import IconSelect from './icon-chevron-down.svg';

import { Select, SelectItem, SelectLabel, SelectPopover, useSelectState } from 'ariakit/select';

type DropdownProps = {
  label: string;
  items: { value: string; label?: string }[];
  onChange: (value: string) => void;
};

export const Dropdown = ({ label, items, onChange }: DropdownProps) => {
  const state = useSelectState({ setValue: onChange });
  return (
    <p className={styles.base}>
      <SelectLabel state={state} className={styles.label}>
        {label}
      </SelectLabel>
      <Select state={state} className={styles.trigger}>
        {items.find(({ value }) => value === state.value)?.label}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={IconSelect.src} alt="" />
      </Select>
      <SelectPopover state={state}>
        {items.map(({ value, label }) => (
          <SelectItem key={value} value={value}>
            {label}
          </SelectItem>
        ))}
      </SelectPopover>
    </p>
  );
};
