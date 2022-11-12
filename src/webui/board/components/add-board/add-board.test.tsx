import { faker } from '@faker-js/faker';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { AddBoard } from './add-board';
import { addBoard } from 'core/usecases';

jest.mock('webui/shared/components/modal/modal');

jest.mock('core/usecases');
const mockAddBoardFn = addBoard as jest.MockedFunction<typeof addBoard>;
mockAddBoardFn.mockImplementation(() => {
  return Promise.resolve({ ok: true, boardId: faker.datatype.uuid() });
});

beforeEach(() => {
  jest.clearAllMocks();
});

let userEvt = userEvent.setup();

const getBoardNameElt = () => screen.getByLabelText(/Board Name/, { selector: 'input' });
const getColumnNameEltList = () => screen.queryAllByLabelText(/Column Name/, { selector: 'input' });
const getColumnDeleteEltList = () => screen.queryAllByRole('button', { name: /Delete item/i });
const getAddColumnBtnElt = () => screen.getByRole('button', { name: /Add New Column/i });
const getSubmitBtnElt = () => screen.getByRole('button', { name: /Create New Board/i });
const getBoardNameErrorElt = () => screen.getAllByRole('status')[0];
const getColumnNameErrorEltList = () => screen.getAllByRole('status').slice(1);

const testProps = {
  isOpen: true,
  close: jest.fn(),
  onAdd: jest.fn(),
};
const expectedInitialColumnsCount = 1;

describe('AddBoard component', () => {
  it('should initially display one column input', () => {
    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    const expectedLength = expectedInitialColumnsCount;
    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it('should add column to the form', async () => {
    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    await userEvt.click(getAddColumnBtnElt());

    const expectedLength = expectedInitialColumnsCount + 1;
    expect(getColumnNameEltList().length).toBe(expectedLength);
    expect(getColumnDeleteEltList().length).toBe(expectedLength);
    expect(getColumnNameErrorEltList().length).toBe(expectedLength);
  });

  it('should delete column from the form', async () => {
    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    expect(expectedInitialColumnsCount).toBeGreaterThanOrEqual(1);
    await userEvt.click(getColumnDeleteEltList()[0]);

    const expectedLength = expectedInitialColumnsCount - 1;
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
    const expectedError = /Can't be empty/i;

    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    expect(getBoardNameErrorElt()).toBeEmptyDOMElement();
    expect(expectedInitialColumnsCount).toBeGreaterThanOrEqual(1);
    expect(getColumnNameEltList().length).toBe(expectedInitialColumnsCount);
    expect(getColumnNameErrorEltList().length).toBe(expectedInitialColumnsCount);
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
    expect(addBoard).not.toHaveBeenCalled();
    expect(testProps.close).not.toHaveBeenCalled();
    expect(testProps.onAdd).not.toHaveBeenCalled();
  });

  it('should trim text input values', async () => {
    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    const testBoardName = `  ${faker.lorem.words()}  `;
    expect(expectedInitialColumnsCount).toBeGreaterThanOrEqual(1);
    expect(getColumnNameEltList().length).toBe(expectedInitialColumnsCount);
    expect(getColumnNameErrorEltList().length).toBe(expectedInitialColumnsCount);
    const testBoardColumns = [] as string[];
    for (let i = 0; i < expectedInitialColumnsCount; i++) {
      testBoardColumns.push(`     ${faker.lorem.words()}    `);
    }

    await userEvt.type(getBoardNameElt(), testBoardName);
    for (let i = 0; i < testBoardColumns.length; i++) {
      await userEvt.type(getColumnNameEltList()[i], testBoardColumns[i]);
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addBoard).toHaveBeenCalled());

    expect(getBoardNameElt()).toHaveDisplayValue(testBoardName.trim());
    expect(getBoardNameErrorElt()).toBeEmptyDOMElement();
    for (let i = 0; i < testBoardColumns.length; i++) {
      expect(getColumnNameEltList()[i]).toHaveDisplayValue(testBoardColumns[i].trim());
      expect(getColumnNameErrorEltList()[i]).toBeEmptyDOMElement();
    }
    expect(addBoard).toHaveBeenCalledTimes(1);
    expect(addBoard).toHaveBeenLastCalledWith({
      name: testBoardName.trim(),
      columns: testBoardColumns.map((colName) => ({ name: colName.trim() })),
    });
  });

  it('should handle usecase success', async () => {
    const testNewBoardId = faker.datatype.uuid();
    mockAddBoardFn.mockImplementationOnce(() => {
      return Promise.resolve({ ok: true, boardId: testNewBoardId });
    });

    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    await userEvt.type(getBoardNameElt(), faker.lorem.words());
    for (let i = 0; i < getColumnNameEltList().length; i++) {
      await userEvt.type(getColumnNameEltList()[i], faker.lorem.words());
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addBoard).toHaveBeenCalled());

    expect(addBoard).toHaveBeenCalledTimes(1);
    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(testProps.onAdd).toHaveBeenCalledTimes(1);
    expect(testProps.onAdd).toHaveBeenLastCalledWith(testNewBoardId);
  });

  it('should handle usecase error', async () => {
    mockAddBoardFn.mockImplementationOnce(() => {
      return Promise.resolve({ ok: false });
    });

    userEvt = userEvent.setup();
    render(<AddBoard {...testProps} />);

    await userEvt.type(getBoardNameElt(), faker.lorem.words());
    for (let i = 0; i < getColumnNameEltList().length; i++) {
      await userEvt.type(getColumnNameEltList()[i], faker.lorem.words());
    }
    await userEvt.click(getSubmitBtnElt());
    await waitFor(() => expect(addBoard).toHaveBeenCalled());

    expect(addBoard).toHaveBeenCalledTimes(1);
    expect(testProps.close).toHaveBeenCalledTimes(1);
    expect(testProps.onAdd).not.toHaveBeenCalled();
  });
});
