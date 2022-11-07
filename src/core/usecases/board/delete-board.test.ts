import { faker } from '@faker-js/faker';

import { deleteBoard } from './delete-board';
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
const mockDeleteBoardFn = boardRepository.deleteBoard as jest.MockedFunction<
  typeof boardRepository.deleteBoard
>;

describe('deleteBoard()', () => {
  it('should handle success', async () => {
    const testBoardId = faker.datatype.uuid();

    const result = await deleteBoard(testBoardId);

    expect(result).toEqual({ ok: true });
    expect(boardRepository.deleteBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.deleteBoard).toHaveBeenLastCalledWith(mockUserId, testBoardId);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoardId = faker.datatype.uuid();
    const testError = 'Operation failed';
    mockDeleteBoardFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await deleteBoard(testBoardId);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.deleteBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.deleteBoard).toHaveBeenLastCalledWith(mockUserId, testBoardId);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoardId = faker.datatype.uuid();
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await deleteBoard(testBoardId);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.deleteBoard).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
