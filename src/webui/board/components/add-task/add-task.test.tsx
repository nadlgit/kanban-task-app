import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { AddTask } from './add-task';
import { addTask } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');

jest.mock('core/usecases');
const mockAddTaskFn = addTask as jest.MockedFunction<typeof addTask>;
mockAddTaskFn.mockImplementation(() => {
  return Promise.resolve({ ok: true, taskId: faker.datatype.uuid() });
});

beforeEach(() => {
  jest.clearAllMocks();
});

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
const getSubmitBtnElt = () => screen.getByRole('button', { name: /Create Task/i });
const getTaskTitleErrorElt = () => screen.getAllByRole('status')[0];
const getTaskDescErrorElt = () => screen.getAllByRole('status')[1];
const getSubtaskTitleErrorEltList = () => screen.getAllByRole('status').slice(2);

const testProps = {
  isOpen: true,
  close: jest.fn(),
  board: {
    id: faker.datatype.uuid(),
    name: faker.lorem.words(),
    columns: [
      {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        tasks: [],
      },
      {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        tasks: [],
      },
    ],
  },
};
const expectedInitialSubtasksCount = 1;

describe('AddTask component', () => {
  it('should initially display one subtask input', () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    const expectedLength = expectedInitialSubtasksCount;
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskDeleteEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
  });

  it('should add subtask to the form', async () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    await userEvt.click(getAddSubtaskBtnElt());

    const expectedLength = expectedInitialSubtasksCount + 1;
    expect(getSubtaskTitleEltList().length).toBe(expectedLength);
    expect(getSubtaskDeleteEltList().length).toBe(expectedLength);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedLength);
  });

  it('should delete subtask from the form', async () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    expect(expectedInitialSubtasksCount).toBeGreaterThanOrEqual(1);
    await userEvt.click(getSubtaskDeleteEltList()[0]);

    const expectedLength = expectedInitialSubtasksCount - 1;
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
    const expectedError = /Can't be empty/i;

    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    expect(getTaskTitleErrorElt()).toBeEmptyDOMElement();
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    expect(expectedInitialSubtasksCount).toBeGreaterThanOrEqual(1);
    expect(getSubtaskTitleEltList().length).toBe(expectedInitialSubtasksCount);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedInitialSubtasksCount);
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
    expect(getTaskDescElt()).toHaveDisplayValue('');
    expect(getTaskTitleErrorElt()).toHaveTextContent(expectedError);
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    for (const elt of getSubtaskTitleEltList()) {
      expect(elt).toHaveDisplayValue('');
    }
    for (const elt of getSubtaskTitleErrorEltList()) {
      expect(elt).toHaveTextContent(expectedError);
    }
    expect(addTask).not.toHaveBeenCalled();
    expect(testProps.close).not.toHaveBeenCalled();
  });

  it('should trim text input values', async () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    const testTaskTitle = `  ${faker.lorem.words()}  `;
    const testTaskDesc = `  ${faker.lorem.words()}  `;
    expect(expectedInitialSubtasksCount).toBeGreaterThanOrEqual(1);
    expect(getSubtaskTitleEltList().length).toBe(expectedInitialSubtasksCount);
    expect(getSubtaskTitleErrorEltList().length).toBe(expectedInitialSubtasksCount);
    const testSubtasks = [] as string[];
    for (let i = 0; i < expectedInitialSubtasksCount; i++) {
      testSubtasks.push(`     ${faker.lorem.words()}    `);
    }
    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(1);
    const { id: testStatusId } = testProps.board.columns[0];

    await userEvt.type(getTaskTitleElt(), testTaskTitle);
    await userEvt.type(getTaskDescElt(), testTaskDesc);
    for (let i = 0; i < testSubtasks.length; i++) {
      await userEvt.type(getSubtaskTitleEltList()[i], testSubtasks[i]);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addTask).toHaveBeenCalled());

    expect(getTaskTitleElt()).toHaveDisplayValue(testTaskTitle.trim());
    expect(getTaskTitleErrorElt()).toBeEmptyDOMElement();
    expect(getTaskDescElt()).toHaveDisplayValue(testTaskDesc.trim());
    expect(getTaskDescErrorElt()).toBeEmptyDOMElement();
    for (let i = 0; i < testSubtasks.length; i++) {
      expect(getSubtaskTitleEltList()[i]).toHaveDisplayValue(testSubtasks[i].trim());
      expect(getSubtaskTitleErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(addTask).toHaveBeenCalledTimes(1);
    expect(addTask).toHaveBeenLastCalledWith(testProps.board.id, testStatusId, {
      title: testTaskTitle.trim(),
      description: testTaskDesc.trim(),
      subtasks: testSubtasks.map((title) => ({ title: title.trim(), isCompleted: false })),
    });
  });

  it('should initially display status list first item', async () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(2);
    const expectedStatus = testProps.board.columns[0];
    expect(getStatusElt()).toHaveTextContent(expectedStatus.name);
  });

  it('should handle usecase success', async () => {
    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    const expectedTask = {
      title: faker.lorem.words(),
      description: faker.lorem.words(),
      subtasks: [] as { title: string; isCompleted: boolean }[],
    };
    for (let i = 0; i < getSubtaskTitleEltList().length; i++) {
      expectedTask.subtasks.push({ title: faker.lorem.words(), isCompleted: false });
    }

    expect(testProps.board.columns.length).toBeGreaterThanOrEqual(2);
    const { id: testStatusId, name: testStatusLabel } = testProps.board.columns[1];
    expect(getStatusElt()).not.toHaveTextContent(testStatusLabel);

    await userEvt.type(getTaskTitleElt(), expectedTask.title);
    await userEvt.type(getTaskDescElt(), expectedTask.description);
    for (let i = 0; i < getSubtaskTitleEltList().length; i++) {
      await userEvt.type(getSubtaskTitleEltList()[i], expectedTask.subtasks[i].title);
    }
    await userEvt.click(getStatusElt());
    await userEvt.click(getStatusOptionElt(testStatusLabel));
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addTask).toHaveBeenCalled());

    expect(addTask).toHaveBeenCalledTimes(1);
    expect(addTask).toHaveBeenLastCalledWith(testProps.board.id, testStatusId, expectedTask);
    expect(testProps.close).toHaveBeenCalledTimes(1);
  });

  it('should handle usecase error', async () => {
    mockAddTaskFn.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<AddTask {...testProps} />);

    await userEvt.type(getTaskTitleElt(), faker.lorem.words());
    for (const elt of getSubtaskTitleEltList()) {
      await userEvt.type(elt, faker.lorem.words());
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addTask).toHaveBeenCalled());

    expect(addTask).toHaveBeenCalledTimes(1);
    expect(testProps.close).toHaveBeenCalledTimes(1);
  });
});
