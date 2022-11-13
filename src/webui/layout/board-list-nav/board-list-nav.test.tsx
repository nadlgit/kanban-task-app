import { faker } from '@faker-js/faker';
import { act, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import { useEffect } from 'react';
import type { PropsWithChildren } from 'react';

import { BoardListNav } from './board-list-nav';
import { getBoardList, onBoardListChange } from 'core/usecases';
import { AddBoard, BoardContextProvider } from 'webui/board';
import { doNothing } from 'webui/shared';

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
  <BoardContextProvider>{children}</BoardContextProvider>
);

let userEvt = userEvent.setup();

const activeClass = 'active';
const getBoardEltList = () => screen.getAllByRole('listitem').slice(0, -1);
const getAddBoardBtnElt = () => screen.getByRole('button', { name: /\+ Create New Board/i });

describe('BoardListNav component', () => {
  it('should initially display list first board as active', async () => {
    const initialBoardListLength = mockBoardList.length;
    expect(initialBoardListLength).toBeGreaterThanOrEqual(2);
    const expectedLength = initialBoardListLength;
    const expectedActiveIndex = 0;

    userEvt = userEvent.setup();
    await act(async () => {
      render(<BoardListNav />, { wrapper: Wrapper });
    });

    expect(getBoardEltList()).toHaveLength(expectedLength);
    for (let i = 0; i < getBoardEltList().length; i++) {
      const elt = getBoardEltList()[i];
      if (i === expectedActiveIndex) {
        expect(elt).toHaveClass(activeClass);
      } else {
        expect(elt).not.toHaveClass(activeClass);
      }
    }
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

    expect(getBoardEltList()).toHaveLength(expectedLength);
    for (let i = 0; i < getBoardEltList().length; i++) {
      const elt = getBoardEltList()[i];
      if (i === expectedActiveIndex) {
        expect(elt).toHaveClass(activeClass);
      } else {
        expect(elt).not.toHaveClass(activeClass);
      }
    }
  });
});
