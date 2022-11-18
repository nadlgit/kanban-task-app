import { faker } from '@faker-js/faker';

import { deleteTask } from './delete-task';
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
const mockDeleteTaskFn = boardRepository.deleteTask as jest.MockedFunction<
  typeof boardRepository.deleteTask
>;

describe('deleteTask()', () => {
  it('should handle success', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTaskId = faker.datatype.uuid();

    const result = await deleteTask(testBoardId, testColumnId, testTaskId);

    expect(result).toEqual({ ok: true });
    expect(boardRepository.deleteTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.deleteTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testColumnId,
      testTaskId
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTaskId = faker.datatype.uuid();
    const testError = 'Operation failed';
    mockDeleteTaskFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await deleteTask(testBoardId, testColumnId, testTaskId);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.deleteTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.deleteTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testColumnId,
      testTaskId
    );
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTaskId = faker.datatype.uuid();
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await deleteTask(testBoardId, testColumnId, testTaskId);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.deleteTask).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
