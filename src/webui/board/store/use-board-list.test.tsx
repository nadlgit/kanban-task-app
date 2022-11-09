import { faker } from '@faker-js/faker';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';

import { BoardContextProvider } from './context-provider';
import { resetActiveBoardId } from './reset-active-board-id';
import { useBoardList } from './use-board-list';
import { getBoardList } from 'core/usecases';

jest.mock('./reset-active-board-id');
const mockResetActiveBoardId = resetActiveBoardId as jest.MockedFunction<typeof resetActiveBoardId>;

jest.mock('core/usecases');
const mockGetBoardList = getBoardList as jest.MockedFunction<typeof getBoardList>;
mockGetBoardList.mockImplementation(() => {
  return Promise.resolve([]);
});

const Wrapper = ({ children }: PropsWithChildren) => (
  <BoardContextProvider>{children}</BoardContextProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
});

const testBoardListFactory = (length: number) => {
  const list = [] as { id: string; name: string }[];
  for (let i = 0; i < Math.max(1, length); i++) {
    list.push({ id: faker.datatype.uuid(), name: faker.lorem.words() });
  }
  return list;
};

describe('useBoardList()', () => {
  it('should handle loading state and call resetActiveBoardId', async () => {
    const testBoardList = testBoardListFactory(2);
    const testActiveBoardId = testBoardList[0].id;
    mockGetBoardList.mockImplementationOnce(() => {
      return Promise.resolve(testBoardList);
    });
    mockResetActiveBoardId.mockImplementationOnce(() => {
      return testActiveBoardId;
    });

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });

    expect(result.current.loading).toBeTruthy();
    expect(result.current.boardList).toEqual([]);
    expect(result.current.activeBoardId).toBeNull();
    expect(typeof result.current.setActiveBoardId).toBe('function');
    await waitFor(() => expect(result.current.loading).toBeFalsy());
    expect(getBoardList).toHaveBeenCalledTimes(1);
    expect(resetActiveBoardId).toHaveBeenCalledTimes(1);
    expect(resetActiveBoardId).toHaveBeenCalledWith(testBoardList, null);
    expect(result.current.boardList).toEqual(testBoardList);
    expect(result.current.activeBoardId).toEqual(testActiveBoardId);
    expect(typeof result.current.setActiveBoardId).toBe('function');
  });

  it('setActiveBoardId() should update activeBoardId when valid value', async () => {
    const testBoardList = testBoardListFactory(3);
    const testActiveBoardIdFirst = testBoardList[0].id;
    mockGetBoardList.mockImplementationOnce(() => {
      return Promise.resolve(testBoardList);
    });
    mockResetActiveBoardId.mockImplementationOnce(() => {
      return testActiveBoardIdFirst;
    });
    const testActiveBoardIdSecond = testBoardList[testBoardList.length - 1].id;
    expect(testActiveBoardIdSecond).not.toEqual(testActiveBoardIdFirst);

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBeFalsy());
    act(() => {
      result.current.setActiveBoardId(testActiveBoardIdSecond);
    });
    expect(result.current.activeBoardId).toEqual(testActiveBoardIdSecond);
  });

  it('setActiveBoardId() should keep activeBoardId unchanged when invalid value', async () => {
    const testBoardList = testBoardListFactory(3);
    const testActiveBoardIdFirst = testBoardList[0].id;
    mockGetBoardList.mockImplementationOnce(() => {
      return Promise.resolve(testBoardList);
    });
    mockResetActiveBoardId.mockImplementationOnce(() => {
      return testActiveBoardIdFirst;
    });
    const testActiveBoardIdSecond = faker.datatype.uuid();
    expect(testActiveBoardIdSecond).not.toEqual(testActiveBoardIdFirst);

    const { result } = renderHook(() => useBoardList(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.loading).toBeFalsy());
    act(() => {
      result.current.setActiveBoardId(testActiveBoardIdSecond);
    });
    expect(result.current.activeBoardId).toEqual(testActiveBoardIdFirst);
  });
});
