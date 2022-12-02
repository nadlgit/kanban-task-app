import { faker } from '@faker-js/faker';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { BoardContextProvider } from './context-provider';
import { useBoardList } from './use-board-list';
import type { UniqueId } from 'core/entities';
import { getBoardList, onBoardListChange } from 'core/usecases';
import { doNothing } from 'webui/shared';

jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

const testBoardListFactory = (length: number) => {
  const list = [] as { id: string; name: string }[];
  for (let i = 0; i < length; i++) {
    list.push({ id: faker.datatype.uuid(), name: faker.lorem.words() });
  }
  return list;
};

let mockBoardList: { id: string; name: string }[] = [];
let mockBoardListChangeCallback = doNothing;

const mockGetBoardList = getBoardList as jest.MockedFunction<typeof getBoardList>;
mockGetBoardList.mockImplementation(() => Promise.resolve(mockBoardList));

const mockOnBoardListChange = onBoardListChange as jest.MockedFunction<typeof onBoardListChange>;
mockOnBoardListChange.mockImplementation((callback) => {
  mockBoardListChangeCallback = callback;
  return doNothing;
});

const setMockBoardList = (list: typeof mockBoardList) => {
  mockBoardList = list;
};

const deleteMockBoard = (boardId: UniqueId) => {
  setMockBoardList(mockBoardList.filter(({ id }) => id !== boardId));
  mockBoardListChangeCallback();
};

const Wrapper = ({ children }: PropsWithChildren) => (
  <BoardContextProvider isDemo={false}>{children}</BoardContextProvider>
);

describe('useBoardList()', () => {
  it('should handle loading state', async () => {
    const testBoardList = testBoardListFactory(2);
    expect(testBoardList).not.toEqual([]);
    setMockBoardList(testBoardList);

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });

    expect(result.current.loading).toBeTruthy();
    expect(result.current.boardList).toEqual([]);
    expect(result.current.activeBoardId).toBeNull();
    expect(typeof result.current.setActiveBoardId).toBe('function');

    await waitFor(() => expect(result.current.loading).toBeFalsy());

    expect(getBoardList).toHaveBeenCalledTimes(1);
    expect(result.current.boardList).toEqual(testBoardList);
    expect(result.current.activeBoardId).not.toBeNull();
    expect(typeof result.current.setActiveBoardId).toBe('function');
  });

  it('should initially set activeBoardId to first list item ID', async () => {
    const testBoardList = testBoardListFactory(2);
    setMockBoardList(testBoardList);

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    expect(result.current.activeBoardId).toEqual(testBoardList[0].id);
  });

  it('on list update should keep activeBoardId unchanged when active board is still present', async () => {
    const testBoardList = testBoardListFactory(2);
    setMockBoardList(testBoardList);
    const testBoardIdToDelete = testBoardList[testBoardList.length - 1].id;

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const initialActiveBoardId = result.current.activeBoardId;
    expect(initialActiveBoardId).not.toEqual(testBoardIdToDelete);

    act(() => {
      deleteMockBoard(testBoardIdToDelete);
    });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const finalActiveBoardId = result.current.activeBoardId;
    expect(finalActiveBoardId).toEqual(initialActiveBoardId);
  });

  it('on list update should set activeBoardId to first list item ID when active board is absent', async () => {
    const testBoardList = testBoardListFactory(2);
    setMockBoardList(testBoardList);
    const testBoardIdToDelete = testBoardList[0].id;

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const initialActiveBoardId = result.current.activeBoardId;
    expect(initialActiveBoardId).toEqual(testBoardIdToDelete);

    act(() => {
      deleteMockBoard(testBoardIdToDelete);
    });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const finalActiveBoardId = result.current.activeBoardId;
    expect(finalActiveBoardId).not.toEqual(initialActiveBoardId);
    expect(finalActiveBoardId).toEqual(result.current.boardList[0].id);
  });

  it('on list update should set activeBoardId to null when list is empty', async () => {
    const testBoardList = testBoardListFactory(1);
    setMockBoardList(testBoardList);
    const testBoardIdToDelete = testBoardList[0].id;

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const initialActiveBoardId = result.current.activeBoardId;
    expect(initialActiveBoardId).toEqual(testBoardIdToDelete);

    act(() => {
      deleteMockBoard(testBoardIdToDelete);
    });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    expect(result.current.boardList).toEqual([]);
    const finalActiveBoardId = result.current.activeBoardId;
    expect(finalActiveBoardId).not.toEqual(initialActiveBoardId);
    expect(finalActiveBoardId).toBeNull();
  });

  it('setActiveBoardId() should update activeBoardId when valid value', async () => {
    const testBoardList = testBoardListFactory(2);
    setMockBoardList(testBoardList);
    const testActiveBoardId = testBoardList[testBoardList.length - 1].id;

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    expect(result.current.activeBoardId).not.toEqual(testActiveBoardId);

    act(() => {
      result.current.setActiveBoardId(testActiveBoardId);
    });

    expect(result.current.activeBoardId).toEqual(testActiveBoardId);
  });

  it('setActiveBoardId() should keep activeBoardId unchanged when invalid value', async () => {
    const testBoardList = testBoardListFactory(2);
    setMockBoardList(testBoardList);
    const testActiveBoardId = faker.datatype.uuid();
    expect(testBoardList.map(({ id }) => id).includes(testActiveBoardId)).toBeFalsy();

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.loading).toBeFalsy());

    const initialActiveBoardId = result.current.activeBoardId;
    expect(initialActiveBoardId).not.toEqual(testActiveBoardId);

    act(() => {
      result.current.setActiveBoardId(testActiveBoardId);
    });

    expect(result.current.activeBoardId).toEqual(initialActiveBoardId);
  });
});
