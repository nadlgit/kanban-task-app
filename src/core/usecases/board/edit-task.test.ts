import { faker } from '@faker-js/faker';

import { editTask } from './edit-task';
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
const mockUpdateTaskFn = boardRepository.updateTask as jest.MockedFunction<
  typeof boardRepository.updateTask
>;

describe('editTask()', () => {
  it('should handle success', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      id: faker.datatype.uuid(),
      title: faker.lorem.words(),
      description: faker.lorem.words(),
      subtasks: [
        { title: faker.lorem.words(), isCompleted: false },
        { title: faker.lorem.words(), isCompleted: true },
      ],
      newColumnId: faker.datatype.uuid(),
    };

    const result = await editTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: true });
    expect(boardRepository.updateTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.updateTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testTask.newColumnId,
      testTask,
      undefined,
      testColumnId
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      id: faker.datatype.uuid(),
    };
    const testError = 'Operation failed';
    mockUpdateTaskFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await editTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.updateTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.updateTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testColumnId,
      testTask,
      undefined,
      undefined
    );
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      id: faker.datatype.uuid(),
    };
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await editTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.updateTask).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
