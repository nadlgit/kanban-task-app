import { useCallback, useState } from 'react';

import type { TextFieldGroupInputDef } from './text-field-group';

export const useTextFieldGroupInputList = (initialList: TextFieldGroupInputDef[]) => {
  const [list, setList] = useState(initialList);

  const addItem = useCallback((item: TextFieldGroupInputDef) => {
    setList((l) => [...l, item]);
  }, []);

  const deleteItem = useCallback((index: number) => {
    setList((l) => [...l.slice(0, index), ...l.slice(index + 1)]);
  }, []);

  const newItemName = useCallback((prefix: string) => {
    return `${prefix}${Date.now()}`;
  }, []);

  return { list, addItem, deleteItem, newItemName };
};
