import { faker } from '@faker-js/faker';

import { onBoardChange, onBoardListChange } from './reactive';
import { notifyError } from '../notification';
import { Dependencies } from 'core/dependencies';
import { AUTH_NOT_LOGGED_IN_ERROR } from 'core/ports';

jest.mock('../notification');
jest.mock('core/dependencies/dependencies');

const authRepository = Dependencies.getAuthRepository();
const mockGetUserFn = authRepository.getUser as jest.MockedFunction<typeof authRepository.getUser>;
const mockUserId = faker.datatype.uuid();
mockGetUserFn.mockImplementation(() => ({
  id: mockUserId,
  username: faker.internet.userName(),
}));

const boardRepository = Dependencies.getBoardRepository();
const mockListenToBoardListChangeFn =
  boardRepository.listenToBoardListChange as jest.MockedFunction<
    typeof boardRepository.listenToBoardListChange
  >;
const mockListenToBoardChange = boardRepository.listenToBoardChange as jest.MockedFunction<
  typeof boardRepository.listenToBoardChange
>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('onBoardListChange()', () => {
  it('should handle success', () => {
    const testCallback = jest.fn();

    onBoardListChange(testCallback);

    expect(boardRepository.listenToBoardListChange).toHaveBeenCalledTimes(1);
    expect(boardRepository.listenToBoardListChange).toHaveBeenLastCalledWith(
      mockUserId,
      testCallback
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', () => {
    const testCallback = jest.fn();
    const testError = 'Operation failed';
    mockListenToBoardListChangeFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    onBoardListChange(testCallback);

    expect(boardRepository.listenToBoardListChange).toHaveBeenCalledTimes(1);
    expect(boardRepository.listenToBoardListChange).toHaveBeenLastCalledWith(
      mockUserId,
      testCallback
    );
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', () => {
    const testCallback = jest.fn();
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    onBoardListChange(testCallback);

    expect(boardRepository.listenToBoardListChange).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});

describe('onBoardChange()', () => {
  it('should handle success', () => {
    const testCallback = jest.fn();
    const testBoardId = faker.datatype.uuid();

    onBoardChange(testBoardId, testCallback);

    expect(boardRepository.listenToBoardChange).toHaveBeenCalledTimes(1);
    expect(boardRepository.listenToBoardChange).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testCallback
    );
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', () => {
    const testCallback = jest.fn();
    const testBoardId = faker.datatype.uuid();
    const testError = 'Operation failed';
    mockListenToBoardChange.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    onBoardChange(testBoardId, testCallback);

    expect(boardRepository.listenToBoardChange).toHaveBeenCalledTimes(1);
    expect(boardRepository.listenToBoardChange).toHaveBeenLastCalledWith(
      mockUserId,
      testBoardId,
      testCallback
    );
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', () => {
    const testCallback = jest.fn();
    const testBoardId = faker.datatype.uuid();
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    onBoardChange(testBoardId, testCallback);

    expect(boardRepository.listenToBoardChange).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
