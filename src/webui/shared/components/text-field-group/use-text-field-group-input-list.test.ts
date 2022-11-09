import { faker } from '@faker-js/faker';
import { act, renderHook } from '@testing-library/react';

import type { TextFieldGroupInputDef } from './text-field-group';
import { useTextFieldGroupInputList } from './use-text-field-group-input-list';

const testItemFactory = () => ({ name: faker.datatype.uuid(), label: faker.lorem.words() });
const testListFactory = (length: number) => {
  const list = [] as TextFieldGroupInputDef[];
  for (let i = 0; i < length; i++) {
    list.push(testItemFactory());
  }
  return list;
};

describe('useTextFieldGroupInputList()', () => {
  it('should initialize list', () => {
    const testInitialList = testListFactory(4);

    const { result } = renderHook(() => useTextFieldGroupInputList(testInitialList));

    expect(result.current.list).toEqual(testInitialList);
  });

  it('addItem() should add item', () => {
    const testInitialList = testListFactory(2);
    const testItem = testItemFactory();
    const expectedList = [...testInitialList, testItem];

    const { result } = renderHook(() => useTextFieldGroupInputList(testInitialList));
    act(() => {
      result.current.addItem(testItem);
    });

    expect(result.current.list).toEqual(expectedList);
  });

  it('deleteItem() should delete item', () => {
    const testInitialList = testListFactory(1);
    const testItem = testInitialList[0];
    const expectedList = [] as TextFieldGroupInputDef[];

    const { result } = renderHook(() => useTextFieldGroupInputList(testInitialList));
    act(() => {
      result.current.deleteItem(testItem.name);
    });

    expect(result.current.list).toEqual(expectedList);
  });

  it('setError() should set item error', () => {
    const testInitialList = testListFactory(3);
    const testItem = testInitialList[1];
    expect(testItem?.error).toBeUndefined();
    const testError = faker.lorem.words();

    const { result } = renderHook(() => useTextFieldGroupInputList(testInitialList));
    act(() => {
      result.current.setError(testItem.name, testError);
    });

    expect(testItem?.error).toEqual(testError);
  });
});
