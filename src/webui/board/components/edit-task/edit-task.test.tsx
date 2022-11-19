import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { EditTask } from './edit-task';
import type { BoardEntity, ColumnEntity, TaskEntity } from 'core/entities';
import { editTask } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');
jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

const testTaskFactory = (nbSubtasks = 0) => {
  const task: TaskEntity = {
    id: faker.datatype.uuid(),
    title: faker.lorem.words(),
    description: faker.lorem.words(),
    subtasks: [],
  };
  for (let i = 0; i < nbSubtasks; i++) {
    task.subtasks.push({
      title: faker.lorem.words(),
      isCompleted: !!(i % 2),
    });
  }
  return task;
};
const testColumnFactory = (nbTasks = 0) => {
  const column: ColumnEntity = {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    tasks: [],
  };
  for (let i = 0; i < nbTasks; i++) {
    column.tasks.push(testTaskFactory());
  }
  return column;
};
const testBoardFactory = (nbColumns = 0) => {
  const board: BoardEntity = { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] };
  for (let i = 0; i < nbColumns; i++) {
    board.columns.push(testColumnFactory());
  }
  return board;
};

let userEvt = userEvent.setup();

const getTaskTitleElt = () => screen.getByLabelText(/^Title/, { selector: 'input' });
const getTaskDescElt = () => screen.getByLabelText(/Description/, { selector: 'textarea' });
const getSubtaskTitleEltList = () =>
  screen.queryAllByLabelText(/Subtask Title/, { selector: 'input' });
const getSubtaskDeleteEltList = () => screen.queryAllByRole('button', { name: /Delete item/i });
const getAddSubtaskBtnElt = () => screen.getByRole('button', { name: /Add New Subtask/i });
const getStatusElt = () => screen.getByRole('combobox', { name: /Status/i });
const getStatusOptionElt = (label: string) =>
  screen.getByRole('option', { name: new RegExp(label) });
const getSubmitBtnElt = () => screen.getByRole('button', { name: /Save Changes/i });
const getTaskTitleErrorElt = () => screen.getAllByRole('status')[0];
const getTaskDescErrorElt = () => screen.getAllByRole('status')[1];
const getSubtaskTitleErrorEltList = () => screen.getAllByRole('status').slice(2);

describe('EditTask component', () => {
  it('should initially display task information', () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(2)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    const expectedLength = testTask.subtasks.length;
    expect(expectedLength).toBeGreaterThanOrEqual(1);

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    expect(getTaskTitleElt()).toHaveDisplayValue(testTask.title);
    expect(getTaskDescElt()).toHaveDisplayValue(testTask.description);
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskDeleteEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
    for (let i = 0; i < expectedLength; i++) {
      expect(getSubtaskTitleEltList()[i]).toHaveDisplayValue(testTask.subtasks[i].title);
    }
    expect(getStatusElt()).toHaveTextContent(testColumn.name);
  });

  it('should add subtask to the form', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory()];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.click(getAddSubtaskBtnElt());

    const expectedLength = testTask.subtasks.length + 1;
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskDeleteEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
  });

  it('should delete subtask from the form', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(1);
    await userEvt.click(getSubtaskDeleteEltList()[0]);

    const expectedLength = testTask.subtasks.length - 1;
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskDeleteEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
  });

  it.each([
    {
      trimmed: true,
    },
    {
      trimmed: false,
    },
  ])('should handle empty text inputs: trimmed=$trimmed', async ({ trimmed }) => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    const expectedLength = testTask.subtasks.length;
    expect(expectedLength).toBeGreaterThanOrEqual(1);

    const expectedError = /Can't be empty/i;

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    expect(getTaskTitleErrorElt()).toBeEmptyDOMElement();
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
    for (const elt of getSubtaskTitleErrorEltList()) {
      expect(elt).toBeEmptyDOMElement();
    }

    await userEvt.clear(getTaskTitleElt());
    !trimmed && (await userEvt.type(getTaskTitleElt(), '         '));
    await userEvt.clear(getTaskDescElt());
    !trimmed && (await userEvt.type(getTaskDescElt(), '         '));
    for (const elt of getSubtaskTitleEltList()) {
      await userEvt.clear(elt);
      !trimmed && (await userEvt.type(elt, '        '));
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() =>
      expect(screen.queryAllByText(expectedError).length).toBe(getSubtaskTitleEltList().length + 1)
    );

    expect(getTaskTitleElt()).toHaveDisplayValue('');
    expect(getTaskTitleErrorElt()).toHaveTextContent(expectedError);
    expect(getTaskDescElt()).toHaveDisplayValue('');
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    for (const elt of getSubtaskTitleEltList()) {
      expect(elt).toHaveDisplayValue('');
    }
    for (const elt of getSubtaskTitleErrorEltList()) {
      expect(elt).toHaveTextContent(expectedError);
    }
    expect(editTask).not.toHaveBeenCalled();
    expect(testProps.close).not.toHaveBeenCalled();
  });

  it('should handle submission without modification', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(1);

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editTask).not.toHaveBeenCalled();
  });

  it('should handle submission with updated title', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory()];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    const testTaskUpdate = {
      id: testTask.id,
      title: faker.lorem.words(),
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.clear(getTaskTitleElt());
    await userEvt.type(getTaskTitleElt(), testTaskUpdate.title);
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getTaskTitleElt()).toHaveDisplayValue(testTaskUpdate.title);
    expect(getTaskTitleErrorElt()).toBeEmptyDOMElement();
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should handle submission with updated description', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory()];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    const testTaskUpdate = {
      id: testTask.id,
      description: faker.lorem.words(),
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.clear(getTaskDescElt());
    await userEvt.type(getTaskDescElt(), testTaskUpdate.description);
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getTaskDescElt()).toHaveDisplayValue(testTaskUpdate.description);
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should handle submission with updated status', async () => {
    const testBoard = testBoardFactory(2);
    testBoard.columns[0].tasks = [testTaskFactory()];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testNewColumn = testBoard.columns[1];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    const testTaskUpdate = {
      id: testTask.id,
      newColumnId: testNewColumn.id,
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.click(getStatusElt());
    await userEvt.click(getStatusOptionElt(testNewColumn.name));
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getStatusElt()).toHaveTextContent(testNewColumn.name);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should handle submission with updated subtask title', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(1);

    const testTaskUpdate = {
      id: testTask.id,
      subtasks: testTask.subtasks.map(({ isCompleted }) => ({
        title: faker.lorem.words(),
        isCompleted,
      })),
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    for (let i = 0; i < testTaskUpdate.subtasks.length; i++) {
      await userEvt.clear(getSubtaskTitleEltList()[i]);
      await userEvt.type(getSubtaskTitleEltList()[i], testTaskUpdate.subtasks[i].title);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    for (let i = 0; i < testTaskUpdate.subtasks.length; i++) {
      expect(getSubtaskTitleEltList()[i]).toHaveDisplayValue(
        testTaskUpdate.subtasks[i].title.trim()
      );
      expect(getSubtaskTitleErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should handle submission with added subtask', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory()];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };

    const testTaskUpdate = {
      id: testTask.id,
      subtasks: [...testTask.subtasks, { title: faker.lorem.words(), isCompleted: false }],
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    for (let i = testTask.subtasks.length; i < testTaskUpdate.subtasks.length; i++) {
      await userEvt.click(getAddSubtaskBtnElt());
      await userEvt.type(getSubtaskTitleEltList()[i], testTaskUpdate.subtasks[i].title);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should handle submission with deleted subtask', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(1);

    const testTaskUpdate = {
      id: testTask.id,
      subtasks: testTask.subtasks.slice(1),
    };

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.click(getSubtaskDeleteEltList()[0]);
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, testTaskUpdate);
  });

  it('should trim text input values', async () => {
    const testBoard = testBoardFactory(1);
    testBoard.columns[0].tasks = [testTaskFactory(1)];
    const testColumn = testBoard.columns[0];
    const testTask = testColumn.tasks[0];
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(1);

    const testTaskUpdate = {
      id: testTask.id,
      title: `  ${faker.lorem.words()}  `,
      description: `     ${faker.lorem.words()}      `,
      subtasks: testTask.subtasks.map((st) => ({
        ...st,
        title: `    ${faker.lorem.words()}    `,
      })),
    };
    expect(testTask.title.trim()).not.toEqual(testTaskUpdate.title.trim());
    for (let i = 0; i < testTask.subtasks.length; i++) {
      expect(testTask.subtasks[i].title.trim()).not.toEqual(
        testTaskUpdate.subtasks[i].title.trim()
      );
    }

    userEvt = userEvent.setup();
    render(<EditTask {...testProps} />);

    await userEvt.clear(getTaskTitleElt());
    await userEvt.type(getTaskTitleElt(), testTaskUpdate.title);
    await userEvt.clear(getTaskDescElt());
    await userEvt.type(getTaskDescElt(), testTaskUpdate.description);
    for (let i = 0; i < testTaskUpdate.subtasks.length; i++) {
      await userEvt.clear(getSubtaskTitleEltList()[i]);
      await userEvt.type(getSubtaskTitleEltList()[i], testTaskUpdate.subtasks[i].title);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(editTask).toHaveBeenCalled());

    expect(getTaskTitleElt()).toHaveDisplayValue(testTaskUpdate.title.trim());
    expect(getTaskTitleErrorElt()).toBeEmptyDOMElement();
    expect(getTaskDescElt()).toHaveDisplayValue(testTaskUpdate.description.trim());
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    for (let i = 0; i < testTaskUpdate.subtasks.length; i++) {
      expect(getSubtaskTitleEltList()[i]).toHaveDisplayValue(
        testTaskUpdate.subtasks[i].title.trim()
      );
      expect(getSubtaskTitleErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, {
      id: testTaskUpdate.id,
      title: testTaskUpdate.title.trim(),
      description: testTaskUpdate.description.trim(),
      subtasks: testTaskUpdate.subtasks.map((st) => ({ ...st, title: st.title.trim() })),
      newColumnId: undefined,
    });
  });
});
