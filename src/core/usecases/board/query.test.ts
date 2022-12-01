import { faker } from '@faker-js/faker';

import { getBoard, getBoardList } from './query';
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

const mockGetBoardListFn = boardRepository.getBoardList as jest.MockedFunction<
  typeof boardRepository.getBoardList
>;
const mockBoardList = [
  { id: faker.datatype.uuid(), name: faker.lorem.words() },
  { id: faker.datatype.uuid(), name: faker.lorem.words() },
  { id: faker.datatype.uuid(), name: faker.lorem.words() },
];
mockGetBoardListFn.mockImplementation(() => Promise.resolve(mockBoardList));

const mockGetBoardFn = boardRepository.getBoard as jest.MockedFunction<
  typeof boardRepository.getBoard
>;
const mockBoard = { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] };
mockGetBoardFn.mockImplementation(() => Promise.resolve(mockBoard));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('getBoardList()', () => {
  it('should handle success', async () => {
    const result = await getBoardList();

    expect(result).toEqual(mockBoardList);
    expect(boardRepository.getBoardList).toHaveBeenCalledTimes(1);
    expect(boardRepository.getBoardList).toHaveBeenLastCalledWith(mockUserId);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testError = 'Operation failed';
    mockGetBoardListFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await getBoardList();

    expect(result).toEqual([]);
    expect(boardRepository.getBoardList).toHaveBeenCalledTimes(1);
    expect(boardRepository.getBoardList).toHaveBeenLastCalledWith(mockUserId);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await getBoardList();

    expect(result).toEqual([]);
    expect(boardRepository.getBoardList).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});

describe('getBoard()', () => {
  it('should handle success', async () => {
    const testBoardId = faker.datatype.uuid();

    const result = await getBoard(testBoardId);

    expect(result).toEqual(mockBoard);
    expect(boardRepository.getBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.getBoard).toHaveBeenLastCalledWith(mockUserId, testBoardId);
    expect(notifyError).not.toHaveBeenCalled();
  });

  it('should handle failure', async () => {
    const testBoardId = faker.datatype.uuid();
    const testError = 'Operation failed';
    mockGetBoardFn.mockImplementationOnce(() => {
      throw new Error(testError);
    });

    const result = await getBoard(testBoardId);

    expect(result).toBeNull();
    expect(boardRepository.getBoard).toHaveBeenCalledTimes(1);
    expect(boardRepository.getBoard).toHaveBeenLastCalledWith(mockUserId, testBoardId);
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });

  it('should handle not logged user', async () => {
    const testBoardId = faker.datatype.uuid();
    const testError = AUTH_NOT_LOGGED_IN_ERROR.message;
    mockGetUserFn.mockImplementationOnce(() => null);

    const result = await getBoard(testBoardId);

    expect(result).toBeNull();
    expect(boardRepository.getBoard).not.toHaveBeenCalled();
    expect(notifyError).toHaveBeenCalledTimes(1);
    expect(notifyError).toHaveBeenLastCalledWith(testError);
  });
});
