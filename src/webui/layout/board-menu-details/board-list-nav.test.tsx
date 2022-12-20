import { faker } from '@faker-js/faker';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardListNav } from './board-list-nav';
import { getBoardList, onBoardListChange } from 'core/usecases';
import { doNothing } from 'core/utils';
import { AddBoard, BoardContextProvider } from 'webui/board';

jest.mock('core/usecases');
jest.mock('webui/board/components/add-board/add-board');

beforeEach(() => {
  jest.clearAllMocks();
});

const boardListItemFactory = () => ({
  id: faker.datatype.uuid(),
  name: faker.lorem.words(),
});

const mockBoardList = [boardListItemFactory(), boardListItemFactory()];
let mockBoardListChangeCallback = doNothing;

const mockGetBoardList = getBoardList as jest.MockedFunction<typeof getBoardList>;
mockGetBoardList.mockImplementation(() => Promise.resolve(mockBoardList));

const mockOnBoardListChange = onBoardListChange as jest.MockedFunction<typeof onBoardListChange>;
mockOnBoardListChange.mockImplementation((callback) => {
  mockBoardListChangeCallback = callback;
  return doNothing;
});

const mockAddBoardComponent = AddBoard as jest.MockedFunction<typeof AddBoard>;
mockAddBoardComponent.mockImplementation(({ isOpen, close, onAdd }) => {
  useEffect(() => {
    if (isOpen) {
      const newBoard = boardListItemFactory();
      mockBoardList.push(newBoard);
      mockBoardListChangeCallback();
      onAdd && onAdd(newBoard.id);
      close();
    }
  }, [close, isOpen, onAdd]);
  return <></>;
});

const Wrapper = ({ children }: PropsWithChildren) => (
  <BoardContextProvider isDemo={false}>{children}</BoardContextProvider>
);

let userEvt = userEvent.setup();

const getBoardActiveItem = () =>
  within(screen.getByRole('listitem', { current: true })).getByRole('button');
const getAddBoardBtnElt = () => screen.getByRole('button', { name: /\+ Create New Board/i });

describe('BoardListNav component', () => {
  it('should initially display list first board as active', async () => {
    const initialBoardListLength = mockBoardList.length;
    expect(initialBoardListLength).toBeGreaterThanOrEqual(2);
    const expectedActiveIndex = 0;

    userEvt = userEvent.setup();
    await act(async () => {
      render(<BoardListNav />, { wrapper: Wrapper });
    });

    expect(getBoardActiveItem()).toHaveAccessibleName(mockBoardList[expectedActiveIndex].name);
  });

  it('should set added board as active', async () => {
    const initialBoardListLength = mockBoardList.length;
    expect(initialBoardListLength).toBeGreaterThanOrEqual(2);
    const expectedLength = initialBoardListLength + 1;
    const expectedActiveIndex = expectedLength - 1;

    userEvt = userEvent.setup();
    await act(async () => {
      render(<BoardListNav />, { wrapper: Wrapper });
    });

    await userEvt.click(getAddBoardBtnElt());

    await waitFor(() =>
      expect(getBoardActiveItem()).toHaveAccessibleName(mockBoardList[expectedActiveIndex].name)
    );
  });
});
