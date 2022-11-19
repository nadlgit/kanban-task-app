import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { ViewTask } from './view-task';
import type { TaskEntity } from 'core/entities';
import { editTask } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');
jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

const testBoard = {
  id: faker.datatype.uuid(),
  name: faker.lorem.words(),
  columns: [
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [] as TaskEntity[],
    },
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [
            {
              title: faker.lorem.words(),
              isCompleted: false,
            },
            {
              title: faker.lorem.words(),
              isCompleted: true,
            },
          ],
        },
      ] as TaskEntity[],
    },
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [] as TaskEntity[],
    },
  ],
};
const testColumn = testBoard.columns[1];
const testTask = testColumn.tasks[0];

let userEvt = userEvent.setup();

const getSubtaskElt = (label: string) => screen.getByRole('checkbox', { name: new RegExp(label) });
const getStatusElt = () => screen.getByRole('combobox', { name: /Status/i });
const getStatusOptionElt = (label: string) =>
  screen.getByRole('option', { name: new RegExp(label) });
const getMockCloseModalBtnElt = () => screen.getByTestId('mock-close-modal-btn');
const getMenuBtnElt = () => screen.getByRole('button', { name: /Toggle menu/i });
const getEditMenuItemElt = () => screen.getByRole('menuitem', { name: /Edit Task/i });
const getDeleteMenuItemElt = () => screen.getByRole('menuitem', { name: /Delete Task/i });

describe('EditTask component', () => {
  it('should initially display subtasks status and task status', () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };
    expect(testBoard.columns.length).toBeGreaterThanOrEqual(2);
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(2);

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    for (let i = 0; i < testTask.subtasks.length; i++) {
      testTask.subtasks[i].isCompleted
        ? expect(getSubtaskElt(testTask.subtasks[i].title)).toBeChecked()
        : expect(getSubtaskElt(testTask.subtasks[i].title)).not.toBeChecked();
    }
    expect(getStatusElt()).toHaveTextContent(testColumn.name);
  });

  it('should handle close without modification', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    await userEvt.click(getMockCloseModalBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(editTask).not.toHaveBeenCalled();
  });

  it('should handle close with updated task status', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };
    expect(testBoard.columns.length).toBeGreaterThanOrEqual(2);
    const testNewColumn = testBoard.columns[testBoard.columns.length - 1];
    expect(testNewColumn.id).not.toEqual(testColumn.id);

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    await userEvt.click(getStatusElt());
    await userEvt.click(getStatusOptionElt(testNewColumn.name));
    await userEvt.click(getMockCloseModalBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(getStatusElt()).toHaveTextContent(testNewColumn.name);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, {
      id: testTask.id,
      newColumnId: testNewColumn.id,
    });
  });

  it('should handle close with updated subtask status', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(2);

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    for (let i = 0; i < testTask.subtasks.length; i++) {
      await userEvt.click(getSubtaskElt(testTask.subtasks[i].title));
    }
    await userEvt.click(getMockCloseModalBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    for (let i = 0; i < testTask.subtasks.length; i++) {
      testTask.subtasks[i].isCompleted
        ? expect(getSubtaskElt(testTask.subtasks[i].title)).not.toBeChecked()
        : expect(getSubtaskElt(testTask.subtasks[i].title)).toBeChecked();
    }
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, {
      id: testTask.id,
      subtasks: testTask.subtasks.map(({ title, isCompleted }) => ({
        title,
        isCompleted: !isCompleted,
      })),
    });
  });

  it('should handle open edit without pending updates', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    await userEvt.click(getMenuBtnElt());
    await userEvt.click(getEditMenuItemElt());
    await waitFor(() => expect(testProps.openEditTask).toHaveBeenCalled());

    expect(testProps.openEditTask).toHaveBeenCalledTimes(1);
    expect(editTask).not.toHaveBeenCalled();
  });

  it('should handle open edit with pending updates', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(2);

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    for (let i = 0; i < testTask.subtasks.length; i++) {
      await userEvt.click(getSubtaskElt(testTask.subtasks[i].title));
    }
    await userEvt.click(getMenuBtnElt());
    await userEvt.click(getEditMenuItemElt());
    await waitFor(() => expect(testProps.openEditTask).toHaveBeenCalled());

    expect(testProps.openEditTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, {
      id: testTask.id,
      subtasks: testTask.subtasks.map(({ title, isCompleted }) => ({
        title,
        isCompleted: !isCompleted,
      })),
    });
  });

  it('should handle open delete without pending updates', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    await userEvt.click(getMenuBtnElt());
    await userEvt.click(getDeleteMenuItemElt());
    await waitFor(() => expect(testProps.openDeleteTask).toHaveBeenCalled());

    expect(testProps.openDeleteTask).toHaveBeenCalledTimes(1);
    expect(editTask).not.toHaveBeenCalled();
  });

  it('should handle open delete with pending updates', async () => {
    const testProps = {
      isOpen: true,
      close: jest.fn(),
      board: testBoard,
      columnId: testColumn.id,
      taskId: testTask.id,
      openEditTask: jest.fn(),
      openDeleteTask: jest.fn(),
    };
    expect(testTask.subtasks.length).toBeGreaterThanOrEqual(2);

    userEvt = userEvent.setup();
    render(<ViewTask {...testProps} />);

    for (let i = 0; i < testTask.subtasks.length; i++) {
      await userEvt.click(getSubtaskElt(testTask.subtasks[i].title));
    }
    await userEvt.click(getMenuBtnElt());
    await userEvt.click(getDeleteMenuItemElt());
    await waitFor(() => expect(testProps.openDeleteTask).toHaveBeenCalled());

    expect(testProps.openDeleteTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenCalledTimes(1);
    expect(editTask).toHaveBeenLastCalledWith(testBoard.id, testColumn.id, {
      id: testTask.id,
      subtasks: testTask.subtasks.map(({ title, isCompleted }) => ({
        title,
        isCompleted: !isCompleted,
      })),
    });
  });
});
