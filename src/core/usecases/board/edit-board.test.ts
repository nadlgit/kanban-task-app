import { faker } from '@faker-js/faker';

import { editBoard } from './edit-board';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

jest.mock('../notification');
jest.mock('core/dependencies/dependencies');

beforeEach(() => {
  jest.clearAllMocks();
});

const authRepository = Dependencies.getAuthRepository();
const mockGetUserFn = authRepository.getUser as jest.MockedFunction<typeof authRepository.getUser>;
const mockUserId = faker.datatype.uuid();
mockGetUserFn.mockImplementation(() => ({
  id: mockUserId,
  username: faker.internet.userName(),
}));

const boardRepository = Dependencies.getBoardRepository();
const mockUpdateBoardFn = boardRepository.updateBoard as jest.MockedFunction<
  typeof boardRepository.updateBoard
>;

describe('editBoard()', () => {
  it('should handle success', async () => {
    const testBoard = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      columnsAdded: [
        {
          name: faker.lorem.words(),
        },
        {
          name: faker.lorem.words(),
        },
      ],
      columnsDeleted: [
        {
          id: faker.datatype.uuid(),
        },
        {
          id: faker.datatype.uuid(),
        },
      ],
      columnsUpdated: [
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
        },
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
        },
      ],
    };

    const result = await editBoard(testBoard);

    expect(result).toEqual({ ok: true });
    expect(boardRepository.updateBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.updateBoard).toHaveBeenLastCalledWith(mockUserId, testBoard);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoard = {
      id: faker.datatype.uuid(),
      columnsAdded: [],
      columnsDeleted: [],
      columnsUpdated: [],
    };
    const testError = 'Operation failed';
    mockUpdateBoardFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await editBoard(testBoard);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.updateBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.updateBoard).toHaveBeenLastCalledWith(mockUserId, testBoard);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoard = {
      id: faker.datatype.uuid(),
      columnsAdded: [],
      columnsDeleted: [],
      columnsUpdated: [],
    };
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await editBoard(testBoard);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.updateBoard).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
