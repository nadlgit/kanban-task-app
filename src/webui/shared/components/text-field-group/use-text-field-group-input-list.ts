import { useCallback, useState } from 'react';

import type { TextFieldGroupInputDef } from './text-field-group';

export const useTextFieldGroupInputList = (initialize: () => TextFieldGroupInputDef[]) => {
  //NB: Don't know exactly why, but forcing lazy initialization avoids some weird side effects
  const [list, setList] = useState<TextFieldGroupInputDef[]>(initialize);

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
