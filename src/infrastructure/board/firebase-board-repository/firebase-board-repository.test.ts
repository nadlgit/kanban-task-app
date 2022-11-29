import { faker } from '@faker-js/faker';

import { BOARD_UNDEFINED_ERROR, FirebaseBoardRepository } from './firebase-board-repository';
import {
  getBoardDoc,
  getBoardRef,
  getBoardTaskDocs,
  getTaskRef,
  getUserBoardDocs,
  newBoardRef,
  newColumnId,
  newTaskRef,
  startBatch,
} from './firestore-helpers';
import {
  FirestoreDoc,
  FirestoreDocs,
  FirestoreRef,
  testBoardDataFactory,
  testBoardListDataFactory,
} from './test-utils';
import type { BoardEntity, UniqueId } from 'core/entities';

jest.mock('./firestore-helpers');

let mockBoards: BoardEntity[] = [];
const getMockFirestoreBoardAndTaskDocs = (boardId: UniqueId) => {
  const boardIndex = mockBoards.findIndex(({ id }) => id === boardId);
  const board = boardIndex >= 0 ? mockBoards[boardIndex] : undefined;
  const nextBoardId =
    boardIndex >= 0 && boardIndex < mockBoards.length - 1
      ? mockBoards[boardIndex + 1].id
      : undefined;
  const { boardDoc, taskDocs } = board
    ? testBoardDataFactory(board, nextBoardId)
    : {
        boardDoc: {} as ReturnType<typeof testBoardDataFactory>['boardDoc'],
        taskDocs: [] as ReturnType<typeof testBoardDataFactory>['taskDocs'],
      };
  return { boardDoc, taskDocs };
};

const mockGetUserBoardDocs = getUserBoardDocs as jest.MockedFunction<typeof getUserBoardDocs>;
mockGetUserBoardDocs.mockImplementation(() => {
  const boardDocs = testBoardListDataFactory(
    mockBoards.map(({ id, name }) => ({ id, name }))
  ).boardDocs;
  return Promise.resolve(new FirestoreDocs(boardDocs));
});

const mockGetBoardDoc = getBoardDoc as jest.MockedFunction<typeof getBoardDoc>;
mockGetBoardDoc.mockImplementation((boardId) => {
  const boardDoc = getMockFirestoreBoardAndTaskDocs(boardId).boardDoc;
  return Promise.resolve(new FirestoreDoc(boardDoc));
});

const mockGetBoardTaskDocs = getBoardTaskDocs as jest.MockedFunction<typeof getBoardTaskDocs>;
mockGetBoardTaskDocs.mockImplementation((boardId) => {
  const taskDocs = getMockFirestoreBoardAndTaskDocs(boardId).taskDocs;
  return Promise.resolve(new FirestoreDocs(taskDocs));
});

const mockGetBoardRef = getBoardRef as jest.MockedFunction<typeof getBoardRef>;
mockGetBoardRef.mockImplementation((boardId) => new FirestoreRef({ id: boardId }));

const mockGetTaskRef = getTaskRef as jest.MockedFunction<typeof getTaskRef>;
const mockMakeTaskRefId = (boardId: UniqueId, taskId: UniqueId) => boardId + '-' + taskId;
mockGetTaskRef.mockImplementation(
  (boardId, taskId) => new FirestoreRef({ id: mockMakeTaskRefId(boardId, taskId) })
);

const mockNewBoardRef = newBoardRef as jest.MockedFunction<typeof newBoardRef>;
mockNewBoardRef.mockImplementation(() => new FirestoreRef({ id: faker.datatype.uuid() }));

const mockNewColumnId = newColumnId as jest.MockedFunction<typeof newColumnId>;
mockNewColumnId.mockImplementation(() => faker.datatype.uuid());

const mockNewTaskRef = newTaskRef as jest.MockedFunction<typeof newTaskRef>;
mockNewTaskRef.mockImplementation(() => new FirestoreRef({ id: faker.datatype.uuid() }));

const mockStartBatch = startBatch as jest.MockedFunction<typeof startBatch>;
const mockBatchSet: jest.MockedFunction<ReturnType<typeof startBatch>['set']> = jest.fn();
const mockBatchUpdate: jest.MockedFunction<ReturnType<typeof startBatch>['update']> = jest.fn();
const mockBatchDelete: jest.MockedFunction<ReturnType<typeof startBatch>['delete']> = jest.fn();
const mockBatchCommit: jest.MockedFunction<ReturnType<typeof startBatch>['commit']> = jest.fn();
mockStartBatch.mockImplementation(() => {
  return {
    set: mockBatchSet,
    update: mockBatchUpdate,
    delete: mockBatchDelete,
    commit: mockBatchCommit,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockBoards = [];
});

describe('FirebaseBoardRepository.getBoardList()', () => {
  it('should return board list', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoardList = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
    mockBoards = testBoardList.map(({ id, name }) => ({ id, name, columns: [] }));

    const result = await new FirebaseBoardRepository().getBoardList(testUserId);

    expect(result).toEqual(testBoardList);
    expect(getUserBoardDocs).toHaveBeenCalledTimes(1);
    expect(getUserBoardDocs).toHaveBeenCalledWith(testUserId);
  });
});

describe('FirebaseBoardRepository.getBoard()', () => {
  it('should return board', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoard = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      columns: [
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [
            {
              id: faker.datatype.uuid(),
              title: faker.lorem.words(),
              description: faker.lorem.words(),
              subtasks: [
                {
                  title: faker.lorem.words(),
                  isCompleted: true,
                },
                {
                  title: faker.lorem.words(),
                  isCompleted: false,
                },
              ],
            },
          ],
        },
      ],
    };
    mockBoards = [testBoard];

    const result = await new FirebaseBoardRepository().getBoard(testUserId, testBoard.id);

    expect(result).toEqual(testBoard);
    expect(getBoardDoc).toHaveBeenCalledTimes(1);
    expect(getBoardDoc).toHaveBeenCalledWith(testBoard.id);
    expect(getBoardTaskDocs).toHaveBeenCalledTimes(1);
    expect(getBoardTaskDocs).toHaveBeenCalledWith(testBoard.id);
  });

  it('should throw when board is undefined', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    mockBoards = [];

    await expect(new FirebaseBoardRepository().getBoard(testUserId, testBoardId)).rejects.toEqual(
      BOARD_UNDEFINED_ERROR
    );
    expect(getBoardDoc).toHaveBeenCalledTimes(1);
    expect(getBoardDoc).toHaveBeenCalledWith(testBoardId);
    expect(getBoardTaskDocs).toHaveBeenCalledTimes(1);
    expect(getBoardTaskDocs).toHaveBeenCalledWith(testBoardId);
  });
});

describe('FirebaseBoardRepository.addBoard()', () => {
  it.each([
    { desc: 'index undefined', testIndex: undefined },
    { desc: 'index at start', testIndex: 0 },
    { desc: 'index at middle', testIndex: 1 },
  ])('should handle $desc', async ({ testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardList = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
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
    const testBoardRef = new FirestoreRef({ id: faker.datatype.uuid() });
    const testBoardIndex =
      testIndex !== undefined && testIndex >= 0 && testIndex < testBoardList.length
        ? testIndex
        : testBoardList.length;
    const testPrevBoardRef =
      testBoardIndex > 0
        ? new FirestoreRef({ id: testBoardList[testBoardIndex - 1].id })
        : undefined;
    mockNewBoardRef.mockImplementationOnce(() => testBoardRef);

    mockBoards = testBoardList.map(({ id, name }) => ({ id, name, columns: [] }));
    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    const boardId = await repository.addBoard(testUserId, testBoard, testIndex);

    expect(boardId).toEqual(testBoardRef.id);
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    const [boardRef, boardData] = mockBatchSet.mock.calls[0];
    const testNextBoardId =
      testBoardIndex < testBoardList.length - 1 ? testBoardList[testBoardIndex + 1].id : undefined;
    const testBoardDocData = testBoardDataFactory(
      {
        id: testBoardRef.id,
        name: testBoard.name,
        columns: testBoard.columns.map(({ name }, idx) => ({
          id: mockNewColumnId.mock.results[idx].value,
          name,
          tasks: [],
        })),
      },
      testNextBoardId,
      testUserId
    ).boardDoc.data;
    expect(boardRef).toEqual(testBoardRef);
    expect(boardData).toEqual(testBoardDocData);
    if (testPrevBoardRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      const [prevBoardRef, prevBoardData] = mockBatchUpdate.mock.calls[0];
      expect(prevBoardRef).toEqual(testPrevBoardRef);
      expect(prevBoardData).toEqual({ nextId: testBoardRef.id });
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip('should throw when firestore board document is not complete', async () => {
    // throw ADD_BOARD_MISSING_DATA_ERROR => not testable right now
  });
});

describe('FirebaseBoardRepository.deleteBoard()', () => {
  it.each([
    {
      desc: 'board at start',
      testIndex: 0,
      testBoard: {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [],
      },
    },
    {
      desc: 'board at middle',
      testIndex: 1,
      testBoard: {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [],
      },
    },
    {
      desc: 'board without tasks',
      testBoard: {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [
          { id: faker.datatype.uuid(), name: faker.lorem.words(), tasks: [] },
          { id: faker.datatype.uuid(), name: faker.lorem.words(), tasks: [] },
        ],
      },
    },
    {
      desc: 'board with tasks',
      testBoard: {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [
          {
            id: faker.datatype.uuid(),
            name: faker.lorem.words(),
            tasks: [
              {
                id: faker.datatype.uuid(),
                title: faker.lorem.words(),
                description: faker.lorem.words(),
                subtasks: [],
              },
              {
                id: faker.datatype.uuid(),
                title: faker.lorem.words(),
                description: faker.lorem.words(),
                subtasks: [
                  {
                    title: faker.lorem.words(),
                    isCompleted: true,
                  },
                  {
                    title: faker.lorem.words(),
                    isCompleted: false,
                  },
                ],
              },
            ],
          },
          {
            id: faker.datatype.uuid(),
            name: faker.lorem.words(),
            tasks: [
              {
                id: faker.datatype.uuid(),
                title: faker.lorem.words(),
                description: faker.lorem.words(),
                subtasks: [
                  {
                    title: faker.lorem.words(),
                    isCompleted: false,
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ])('should handle $desc', async ({ testBoard, testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardIndex = testIndex ?? 0;
    const testBoardList = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
    testBoardList[testBoardIndex] = { id: testBoard.id, name: testBoard.name };
    const testBoardRef = new FirestoreRef({ id: testBoard.id });
    const testTaskRefs = testBoard.columns.flatMap(({ tasks }) =>
      tasks.map(({ id }) => new FirestoreRef({ id: mockMakeTaskRefId(testBoard.id, id) }))
    );
    const testPrevBoardRef =
      testBoardIndex > 0
        ? new FirestoreRef({ id: testBoardList[testBoardIndex - 1].id })
        : undefined;
    const testNextBoardId =
      testBoardIndex < testBoardList.length - 1 ? testBoardList[testBoardIndex + 1].id : null;

    mockBoards = testBoardList.map(({ id, name }) =>
      id === testBoard.id ? testBoard : { id, name, columns: [] }
    );
    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.deleteBoard(testUserId, testBoard.id);

    expect(mockBatchDelete).toHaveBeenCalledTimes(1 + testTaskRefs.length);
    for (const param of mockBatchDelete.mock.calls) {
      expect([testBoardRef, ...testTaskRefs]).toContainEqual(param[0]);
    }
    if (testPrevBoardRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      const [prevBoardRef, prevBoardData] = mockBatchUpdate.mock.calls[0];
      expect(prevBoardRef).toEqual(testPrevBoardRef);
      expect(prevBoardData).toEqual({ nextId: testNextBoardId });
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });
});
