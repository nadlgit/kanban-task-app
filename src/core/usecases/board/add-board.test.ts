import { faker } from '@faker-js/faker';

import { addBoard } from './add-board';
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
const mockAddBoardFn = boardRepository.addBoard as jest.MockedFunction<
  typeof boardRepository.addBoard
>;

describe('addBoard()', () => {
  it('should handle success', async () => {
    const testBoard = {
      name: faker.lorem.words(),
      columns: [
        {
          name: faker.lorem.words(),
        },
        {
          name: faker.lorem.words(),
        },
      ],
    };
    const testNewBoardId = faker.datatype.uuid();
    mockAddBoardFn.mockImplementationOnce(() => {
      return Promise.resolve(testNewBoardId);
    });

    const result = await addBoard(testBoard);

    expect(result).toEqual({ ok: true, boardId: testNewBoardId });
    expect(boardRepository.addBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.addBoard).toHaveBeenLastCalledWith(mockUserId, testBoard);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoard = {
      name: faker.lorem.words(),
      columns: [],
    };
    const testError = 'Operation failed';
    mockAddBoardFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await addBoard(testBoard);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.addBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.addBoard).toHaveBeenLastCalledWith(mockUserId, testBoard);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoard = {
      name: faker.lorem.words(),
      columns: [],
    };
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await addBoard(testBoard);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.addBoard).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
