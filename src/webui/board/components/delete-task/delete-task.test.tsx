import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { DeleteTask } from './delete-task';
import { deleteTask } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');
jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

let userEvt = userEvent.setup();

const getConfirmBtnElt = () => screen.getByRole('button', { name: /Delete/i });
const getCancelBtnElt = () => screen.getByRole('button', { name: /Cancel/i });

const testBoard = {
  id: faker.datatype.uuid(),
  name: faker.lorem.words(),
  columns: [
    {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [],
        },
      ],
    },
  ],
};
const testColumnIndex = 0;
const testTaskIndex = 0;
const testProps = {
  isOpen: true,
  close: jest.fn(),
  board: testBoard,
  columnId: testBoard.columns[testColumnIndex].id,
  taskId: testBoard.columns[testColumnIndex].tasks[testTaskIndex].id,
};

describe('DeleteTask component', () => {
  it('should display task title', () => {
    userEvt = userEvent.setup();
    render(<DeleteTask {...testProps} />);

    expect(
      screen.getByText(new RegExp(testBoard.columns[testColumnIndex].tasks[testTaskIndex].title))
    ).toBeInTheDocument();
  });

  it('should handle user confirmation', async () => {
    userEvt = userEvent.setup();
    render(<DeleteTask {...testProps} />);

    await userEvt.click(getConfirmBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenCalledTimes(1);
    expect(deleteTask).toHaveBeenLastCalledWith(
      testProps.board.id,
      testProps.columnId,
      testProps.taskId
    );
  });

  it('should handle user cancellation', async () => {
    userEvt = userEvent.setup();
    render(<DeleteTask {...testProps} />);

    await userEvt.click(getCancelBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(deleteTask).not.toHaveBeenCalled();
  });
});
