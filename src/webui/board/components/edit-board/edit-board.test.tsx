import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { EditBoard } from './edit-board';
import type { BoardEntity } from 'core/entities';
import { editBoard } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');
jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

const testBoardFactory = (nbColumns: number) => {
  const board: BoardEntity = { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] };
  for (let i = 0; i < nbColumns; i++) {
    board.columns.push({
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [],
    });
  }
  return board;
};

const testBoardWithTasksFactory = (columnsNbTasks: number[]) => {
  const board = testBoardFactory(columnsNbTasks.length);
  columnsNbTasks.forEach((nbTasks, idx) => {
    for (let i = 0; i < nbTasks; i++) {
      board.columns[idx].tasks.push({
        id: faker.datatype.uuid(),
        title: faker.lorem.words(),
        description: '',
        subtasks: [],
      });
    }
  });
  return board;
};

let userEvt = userEvent.setup();

const getBoardNameElt = () => screen.getByLabelText(/Board Name/, { selector: 'input' });
const getColumnNameEltList = () => screen.queryAllByLabelText(/Column Name/, { selector: 'input' });
const getColumnDeleteEltList = () => screen.queryAllByRole('button', { name: /Delete item/i });
const getAddColumnBtnElt = () => screen.getByRole('button', { name: /Add New Column/i });
const getSubmitBtnElt = () => screen.getByRole('button', { name: /Save Changes/i });
const getBoardNameErrorElt = () => screen.getAllByRole('status')[0];
const getColumnNameErrorEltList = () => screen.getAllByRole('status').slice(1);
const columnDeleteDialogTitle = /Delete this column/i;
const getColumnDeleteConfirmBtnElt = () => screen.getByRole('button', { name: 'Delete' });
const getColumnDeleteCancelBtnElt = () => screen.getByRole('button', { name: /Cancel/i });

describe('EditBoard component', () => {
  it('should initially display board name and columns', () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(2),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const expectedLength = testProps.board.columns.length;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    expect(getBoardNameElt()).toHaveDisplayValue(testProps.board.name);
    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
    for (let i = 0; i < expectedLength; i++) {
      expect(getColumnNameEltList()[i]).toHaveDisplayValue(testProps.board.columns[i].name);
    }
  });

  it('should add column to the form', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(2),
    };
    const expectedLength = testProps.board.columns.length + 1;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getAddColumnBtnElt());

    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it('should delete column without tasks from the form', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(2),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    expect(testProps.board.columns[0].tasks.length).toBe(0);
    const expectedLength = testProps.board.columns.length - 1;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getColumnDeleteEltList()[0]);

    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it('should ask confirmation to delete column with tasks and display column name', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardWithTasksFactory([3]),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    expect(testProps.board.columns[0].tasks.length).toBeGreaterThanOrEqual(1);

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getColumnDeleteEltList()[0]);
    await screen.findByText(columnDeleteDialogTitle);

    expect(screen.getByText(new RegExp(testProps.board.columns[0].name))).toBeInTheDocument();
  });

  it('should handle user delete column confirmation', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardWithTasksFactory([3]),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    expect(testProps.board.columns[0].tasks.length).toBeGreaterThanOrEqual(1);
    const expectedLength = testProps.board.columns.length - 1;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getColumnDeleteEltList()[0]);
    await screen.findByText(columnDeleteDialogTitle);
    await userEvt.click(getColumnDeleteConfirmBtnElt());

    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it('should handle user delete column cancellation', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardWithTasksFactory([3]),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    expect(testProps.board.columns[0].tasks.length).toBeGreaterThanOrEqual(1);
    const expectedLength = testProps.board.columns.length;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getColumnDeleteEltList()[0]);
    await screen.findByText(columnDeleteDialogTitle);
    await userEvt.click(getColumnDeleteCancelBtnElt());

    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it.each([
    {
      trimmed: true,
    },
    {
      trimmed: false,
    },
  ])('should handle empty text inputs: trimmed=$trimmed', async ({ trimmed }) => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(2),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const expectedError = /Can't be empty/i;

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    expect(getBoardNameErrorElt()).toBeEmptyDOMElement();
    for (const elt of getColumnNameErrorEltList()) {
      expect(elt).toBeEmptyDOMElement();
    }

    await userEvt.clear(getBoardNameElt());
    !trimmed && (await userEvt.type(getBoardNameElt(), '         '));
    for (const elt of getColumnNameEltList()) {
      await userEvt.clear(elt);
      !trimmed && (await userEvt.type(elt, '        '));
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() =>
      expect(screen.queryAllByText(expectedError).length).toBe(getColumnNameEltList().length + 1)
    );

    expect(getBoardNameElt()).toHaveDisplayValue('');
    expect(getBoardNameErrorElt()).toHaveTextContent(expectedError);
    for (const elt of getColumnNameEltList()) {
      expect(elt).toHaveDisplayValue('');
    }
    for (const elt of getColumnNameErrorEltList()) {
      expect(elt).toHaveTextContent(expectedError);
    }
    expect(editBoard).not.toHaveBeenCalled();
    expect(testProps.close).not.toHaveBeenCalled();
  });

  it('should handle submission without modification', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(2),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editBoard).not.toHaveBeenCalled();
  });

  it('should handle submission with updated board name', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(1),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const testBoardUpdate = {
      id: testProps.board.id,
      name: faker.lorem.words(),
    };
    expect(testProps.board.name).not.toEqual(testBoardUpdate.name);

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.clear(getBoardNameElt());
    await userEvt.type(getBoardNameElt(), testBoardUpdate.name);
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getBoardNameElt()).toHaveDisplayValue(testBoardUpdate.name);
    expect(getBoardNameErrorElt()).toBeEmptyDOMElement();
    expect(editBoard).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenLastCalledWith(testBoardUpdate);
  });

  it('should handle submission with updated column name', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(1),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const testBoardUpdate = {
      id: testProps.board.id,
      columnsKept: testProps.board.columns.map(({ id }) => ({
        isAdded: false,
        id,
        name: faker.lorem.words(),
      })),
    };
    for (let i = 0; i < testProps.board.columns.length; i++) {
      expect(testProps.board.columns[i].name).not.toEqual(testBoardUpdate.columnsKept[i].name);
    }

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    for (let i = 0; i < testBoardUpdate.columnsKept.length; i++) {
      await userEvt.clear(getColumnNameEltList()[i]);
      await userEvt.type(getColumnNameEltList()[i], testBoardUpdate.columnsKept[i].name);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    for (let i = 0; i < testBoardUpdate.columnsKept.length; i++) {
      expect(getColumnNameEltList()[i]).toHaveDisplayValue(testBoardUpdate.columnsKept[i].name);
      expect(getColumnNameErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(editBoard).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenLastCalledWith(testBoardUpdate);
  });

  it('should handle submission with added column', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(0),
    };
    expect(testProps.board.columns.length).toBe(0);
    const testColumnsAdded = [{ name: faker.lorem.words() }];
    const testBoardUpdate = {
      id: testProps.board.id,
      columnsKept: [
        ...testProps.board.columns.map(({ id }) => ({
          isAdded: false,
          id,
        })),
        ...testColumnsAdded.map(({ name }) => ({
          isAdded: true,
          name,
        })),
      ],
    };

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    for (let i = 0; i < testColumnsAdded.length; i++) {
      await userEvt.click(getAddColumnBtnElt());
      await userEvt.type(getColumnNameEltList()[i], testColumnsAdded[i].name);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    for (let i = 0; i < testColumnsAdded.length; i++) {
      expect(getColumnNameEltList()[i]).toHaveDisplayValue(testColumnsAdded[i].name);
      expect(getColumnNameErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(editBoard).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenLastCalledWith(testBoardUpdate);
  });

  it('should handle submission with deleted column', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(1),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const testBoardUpdate = {
      id: testProps.board.id,
      columnsDeleted: testProps.board.columns.map(({ id }) => ({
        id,
      })),
    };

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    for (let i = 0; i < testBoardUpdate.columnsDeleted.length; i++) {
      await userEvt.click(getColumnDeleteEltList()[i]);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenLastCalledWith(testBoardUpdate);
  });

  it('should trim text input values', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoardFactory(1),
    };
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const testBoardUpdate = {
      id: testProps.board.id,
      name: `  ${faker.lorem.words()}  `,
      columnsKept: testProps.board.columns.map(({ id }) => ({
        isAdded: false,
        id,
        name: `     ${faker.lorem.words()}    `,
      })),
    };
    expect(testProps.board.name.trim()).not.toEqual(testBoardUpdate.name.trim());
    for (let i = 0; i < testProps.board.columns.length; i++) {
      expect(testProps.board.columns[i].name.trim()).not.toEqual(
        testBoardUpdate.columnsKept[i].name.trim()
      );
    }

    userEvt = userEvent.setup();
    render(<EditBoard {...testProps} />);

    await userEvt.clear(getBoardNameElt());
    await userEvt.type(getBoardNameElt(), testBoardUpdate.name);
    for (let i = 0; i < testProps.board.columns.length; i++) {
      await userEvt.clear(getColumnNameEltList()[i]);
      await userEvt.type(getColumnNameEltList()[i], testBoardUpdate.columnsKept[i].name);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getBoardNameElt()).toHaveDisplayValue(testBoardUpdate.name.trim());
    expect(getBoardNameErrorElt()).toBeEmptyDOMElement();
    for (let i = 0; i < testProps.board.columns.length; i++) {
      expect(getColumnNameEltList()[i]).toHaveDisplayValue(
        testBoardUpdate.columnsKept[i].name.trim()
      );
      expect(getColumnNameErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(editBoard).toHaveBeenCalledTimes(1);
    expect(editBoard).toHaveBeenLastCalledWith({
      ...testBoardUpdate,
      name: testBoardUpdate.name.trim(),
      columnsKept: testBoardUpdate.columnsKept.map((column) => ({
        ...column,
        name: column.name.trim(),
      })),
    });
  });
});
