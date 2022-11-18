import { faker } from '@faker-js/faker';

import { addTask } from './add-task';
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
const mockAddTaskFn = boardRepository.addTask as jest.MockedFunction<
  typeof boardRepository.addTask
>;

describe('addTask()', () => {
  it('should handle success', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      title: faker.lorem.words(),
      description: faker.lorem.words(),
      subtasks: [
        { title: faker.lorem.words(), isCompleted: false },
        { title: faker.lorem.words(), isCompleted: true },
      ],
    };
    const testNewTaskId = faker.datatype.uuid();
    mockAddTaskFn.mockImplementationOnce(() => {
      return Promise.resolve(testNewTaskId);
    });

    const result = await addTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: true, taskId: testNewTaskId });
    expect(boardRepository.addTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.addTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testColumnId,
      testTask
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      title: faker.lorem.words(),
      description: '',
      subtasks: [],
    };
    const testError = 'Operation failed';
    mockAddTaskFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await addTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.addTask).toHaveBeenCalledTimes(1);
    expect(boardRepository.addTask).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testColumnId,
      testTask
    );
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoardId = faker.datatype.uuid();
    const testColumnId = faker.datatype.uuid();
    const testTask = {
      title: faker.lorem.words(),
      description: '',
      subtasks: [],
    };
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await addTask(testBoardId, testColumnId, testTask);

    expect(result).toEqual({ ok: false });
    expect(boardRepository.addTask).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
