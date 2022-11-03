import { useCallback, useState } from 'react';

import type { TextFieldGroupInputDef } from './text-field-group';

export const useTextFieldGroupInputList = (initialList: TextFieldGroupInputDef[]) => {
  const [list, setList] = useState(initialList);

  const addItem = useCallback((item: TextFieldGroupInputDef) => {
    setList((l) => [...l, item]);
  }, []);

  const deleteItem = useCallback((itemName: string) => {
    setList((l) => [...l.filter((item) => item.name !== itemName)]);
  }, []);

  const setError = useCallback((itemName: string, errorMsg: string | undefined) => {
    setList((l) => {
      const targetItem = l.find((item) => item.name === itemName);
      if (targetItem) {
        targetItem.error = errorMsg;
      }
      return [...l];
    });
  }, []);

  return { list, addItem, deleteItem, setError };
};
