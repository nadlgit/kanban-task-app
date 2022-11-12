import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { DeleteBoard } from './delete-board';
import { deleteBoard } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');
jest.mock('core/usecases');

beforeEach(() => {
  jest.clearAllMocks();
});

let userEvt = userEvent.setup();

const getConfirmBtnElt = () => screen.getByRole('button', { name: /Delete/i });
const getCancelBtnElt = () => screen.getByRole('button', { name: /Cancel/i });

const testProps = {
  isOpen: true,
  close: jest.fn(),
  board: { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
};

describe('DeleteBoard component', () => {
  it('should display board name', () => {
    userEvt = userEvent.setup();
    render(<DeleteBoard {...testProps} />);

    expect(screen.getByText(new RegExp(testProps.board.name))).toBeInTheDocument();
  });

  it('should handle user confirmation', async () => {
    userEvt = userEvent.setup();
    render(<DeleteBoard {...testProps} />);

    await userEvt.click(getConfirmBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(deleteBoard).toHaveBeenCalledTimes(1);
    expect(deleteBoard).toHaveBeenLastCalledWith(testProps.board.id);
  });

  it('should handle user cancellation', async () => {
    userEvt = userEvent.setup();
    render(<DeleteBoard {...testProps} />);

    await userEvt.click(getCancelBtnElt());
    await waitFor(() => expect(testProps.close).toHaveBeenCalled());

    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(deleteBoard).not.toHaveBeenCalled();
  });
});
