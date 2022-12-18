import { faker } from '@faker-js/faker';

import {
  addBoardListSubscriptionCallback,
  addBoardSubscriptionCallback,
  getBoardListSubscriptionValue,
  getBoardSubscriptionValue,
} from './data-subscription';
import {
  getBoardDoc,
  getBoardTaskDocs,
  getUserBoardDocs,
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
  onUserBoardDocsSnapshot,
} from './firestore-helpers';
import { emptyFirestoreDoc, emptyFirestoreDocs, FirestoreDoc, FirestoreDocs } from './test-utils';
import { doNothing } from 'core/utils';

jest.mock('./firestore-helpers');

const mockUserData = [
  {
    userId: faker.datatype.uuid(),
    boards: [
      {
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
                ],
              },
            ],
          },
          {
            id: faker.datatype.uuid(),
            name: faker.lorem.words(),
            tasks: [],
          },
        ],
      },
      {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [
          {
            id: faker.datatype.uuid(),
            name: faker.lorem.words(),
            tasks: [],
          },
        ],
      },
    ],
  },
  {
    userId: faker.datatype.uuid(),
    boards: [{ id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] }],
  },
];

const mockGetUserBoardDocs = getUserBoardDocs as jest.MockedFunction<typeof getUserBoardDocs>;
mockGetUserBoardDocs.mockImplementation((userIdParam) => {
  const data = mockUserData.find(({ userId }) => userId === userIdParam);
  if (!data) {
    return Promise.resolve(emptyFirestoreDocs());
  }
  const boardDocs = data.boards.map(({ id, name }, idx) => ({
    id,
    data: {
      owner: userIdParam,
      name,
      columns: {},
      nextId: idx < data.boards.length - 1 ? data.boards[idx + 1].id : null,
    },
  }));
  return Promise.resolve(new FirestoreDocs(boardDocs));
});

const mockGetBoardDoc = getBoardDoc as jest.MockedFunction<typeof getBoardDoc>;
mockGetBoardDoc.mockImplementation((boardId) => {
  const data = mockUserData.find(({ boards }) => boards.find(({ id }) => id === boardId));
  const board = data?.boards.find(({ id }) => id === boardId);
  if (!data || !board) {
    return Promise.resolve(emptyFirestoreDoc());
  }
  const boardIndex = data.boards.findIndex(({ id }) => id === boardId);
  const boardDoc = {
    id: board.id,
    data: {
      owner: data.userId,
      name: board.name,
      columns: Object.fromEntries(
        board.columns.map(({ id, name }, idx) => [
          id,
          { name, nextId: idx < board.columns.length - 1 ? board.columns[idx + 1].id : null },
        ])
      ),
      nextId: boardIndex < data.boards.length - 1 ? data.boards[boardIndex + 1].id : null,
    },
  };
  return Promise.resolve(new FirestoreDoc(boardDoc));
});

const mockGetBoardTaskDocs = getBoardTaskDocs as jest.MockedFunction<typeof getBoardTaskDocs>;
mockGetBoardTaskDocs.mockImplementation((boardId) => {
  const data = mockUserData.find(({ boards }) => boards.find(({ id }) => id === boardId));
  const board = data?.boards.find(({ id }) => id === boardId);
  if (!data || !board) {
    return Promise.resolve(emptyFirestoreDocs());
  }
  const taskDocs = board.columns.flatMap(({ id, name, tasks }) =>
    tasks.map(({ id: taskId, title, description, subtasks }, idx) => ({
      id: taskId,
      data: {
        title,
        description,
        subtasks,
        status: { id, name },
        nextId: idx < tasks.length - 1 ? tasks[idx + 1].id : null,
      },
    }))
  );
  return Promise.resolve(new FirestoreDocs(taskDocs));
});

const mockOnUserBoardDocsSnapshot = onUserBoardDocsSnapshot as jest.MockedFunction<
  typeof onUserBoardDocsSnapshot
>;
const mockOnUserBoardDocsSnapshotCallback: Record<
  Parameters<typeof onUserBoardDocsSnapshot>[0],
  Parameters<typeof onUserBoardDocsSnapshot>[1]
> = {};
mockOnUserBoardDocsSnapshot.mockImplementation((userId, callback) => {
  mockOnUserBoardDocsSnapshotCallback[userId] = callback;
  return doNothing;
});

const mockOnBoardDocSnapshot = onBoardDocSnapshot as jest.MockedFunction<typeof onBoardDocSnapshot>;
const mockOnBoardDocSnapshotCallback: Record<
  Parameters<typeof onBoardDocSnapshot>[0],
  Parameters<typeof onBoardDocSnapshot>[1]
> = {};
mockOnBoardDocSnapshot.mockImplementation((boardId, callback) => {
  mockOnBoardDocSnapshotCallback[boardId] = callback;
  return doNothing;
});

const mockOnBoardTaskDocsSnapshot = onBoardTaskDocsSnapshot as jest.MockedFunction<
  typeof onBoardTaskDocsSnapshot
>;
const mockOnBoardTaskDocsSnapshotCallback: Record<
  Parameters<typeof onBoardTaskDocsSnapshot>[0],
  Parameters<typeof onBoardTaskDocsSnapshot>[1]
> = {};
mockOnBoardTaskDocsSnapshot.mockImplementation((boardId, callback) => {
  mockOnBoardTaskDocsSnapshotCallback[boardId] = callback;
  return doNothing;
});

beforeEach(() => {
  jest.clearAllMocks();
  // mockOnUserBoardDocsSnapshotCallback = {};
  // mockOnBoardDocSnapshotCallback = {};
  // mockOnBoardTaskDocsSnapshotCallback = {};
});

describe('BoardList subscription', () => {
  it('should handle initialization', async () => {
    const testUserId = mockUserData[0].userId;
    const testBoardList = mockUserData[0].boards.map(({ id, name }) => ({ id, name }));

    const result1 = await getBoardListSubscriptionValue(testUserId);
    const result2 = await getBoardListSubscriptionValue(testUserId);

    expect(result1).toEqual(testBoardList);
    expect(result2).toEqual(testBoardList);
    expect(getUserBoardDocs).toHaveBeenCalledTimes(1);
    expect(getUserBoardDocs).toHaveBeenCalledWith(testUserId);
  });

  it('should handle multiple values', async () => {
    const testUserId1 = mockUserData[0].userId;
    const testBoardList1 = mockUserData[0].boards.map(({ id, name }) => ({ id, name }));

    const testUserId2 = mockUserData[1].userId;
    const testBoardList2 = mockUserData[1].boards.map(({ id, name }) => ({ id, name }));

    const result1 = await getBoardListSubscriptionValue(testUserId1);
    const result2 = await getBoardListSubscriptionValue(testUserId2);

    expect(result1).toEqual(testBoardList1);
    expect(result2).toEqual(testBoardList2);
  });

  it('should handle callbacks', () => {
    const testUserId = mockUserData[0].userId;
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();
    const testSnapshot = new FirestoreDocs();

    const unsubcribe1 = addBoardListSubscriptionCallback(testUserId, testCallback1);
    const unsubcribe2 = addBoardListSubscriptionCallback(testUserId, testCallback2);
    mockOnUserBoardDocsSnapshotCallback[testUserId](testSnapshot);
    unsubcribe1();
    mockOnUserBoardDocsSnapshotCallback[testUserId](testSnapshot);
    unsubcribe2();
    mockOnUserBoardDocsSnapshotCallback[testUserId](testSnapshot);
    expect(testCallback1).toHaveBeenCalledTimes(1);
    expect(testCallback2).toHaveBeenCalledTimes(2);
  });
});

describe('Board subscription', () => {
  it('should handle initialization', async () => {
    const testUserId = mockUserData[0].userId;
    const testBoard = mockUserData[0].boards[0];

    const result1 = await getBoardSubscriptionValue(testUserId, testBoard.id);
    const result2 = await getBoardSubscriptionValue(testUserId, testBoard.id);

    expect(result1).toEqual(testBoard);
    expect(result2).toEqual(testBoard);
    expect(getBoardDoc).toHaveBeenCalledTimes(1);
    expect(getBoardDoc).toHaveBeenCalledWith(testBoard.id);
    expect(getBoardTaskDocs).toHaveBeenCalledTimes(1);
    expect(getBoardTaskDocs).toHaveBeenCalledWith(testBoard.id);
  });

  it('should handle multiple values', async () => {
    const testUserId1 = mockUserData[0].userId;
    const testBoard1 = mockUserData[0].boards[0];

    const testUserId2 = mockUserData[0].userId;
    const testBoard2 = mockUserData[0].boards[1];

    const testUserId3 = mockUserData[1].userId;
    const testBoard3 = mockUserData[1].boards[0];

    expect(await getBoardSubscriptionValue(testUserId1, testBoard1.id)).toEqual(testBoard1);
    expect(await getBoardSubscriptionValue(testUserId2, testBoard2.id)).toEqual(testBoard2);
    expect(await getBoardSubscriptionValue(testUserId3, testBoard3.id)).toEqual(testBoard3);
  });

  it('should handle callbacks', () => {
    const testUserId = mockUserData[0].userId;
    const testBoard = mockUserData[0].boards[0];
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();
    const testBoardDoc = {
      id: testBoard.id,
      data: {
        owner: testUserId,
        name: testBoard.name,
        columns: Object.fromEntries(
          testBoard.columns.map(({ id, name }, idx) => [
            id,
            {
              name,
              nextId: idx < testBoard.columns.length - 1 ? testBoard.columns[idx + 1].id : null,
            },
          ])
        ),
        nextId: null,
      },
    };
    const testTaskDocs = testBoard.columns.flatMap(({ id, name, tasks }) =>
      tasks.map(({ id: taskId, title, description, subtasks }, idx) => ({
        id: taskId,
        data: {
          title,
          description,
          subtasks,
          status: { id, name },
          nextId: idx < tasks.length - 1 ? tasks[idx + 1].id : null,
        },
      }))
    );
    const testBoardSnapshot = new FirestoreDoc(testBoardDoc);
    const testTasksSnapshot = new FirestoreDocs(testTaskDocs);

    const unsubcribe1 = addBoardSubscriptionCallback(testUserId, testBoard.id, testCallback1);
    const unsubcribe2 = addBoardSubscriptionCallback(testUserId, testBoard.id, testCallback2);
    mockOnBoardDocSnapshotCallback[testBoard.id](testBoardSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoard.id](testTasksSnapshot);
    unsubcribe1();
    mockOnBoardDocSnapshotCallback[testBoard.id](testBoardSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoard.id](testTasksSnapshot);
    unsubcribe2();
    mockOnBoardDocSnapshotCallback[testBoard.id](testBoardSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoard.id](testTasksSnapshot);
    expect(testCallback1).toHaveBeenCalledTimes(2);
    expect(testCallback2).toHaveBeenCalledTimes(4);
  });
});
