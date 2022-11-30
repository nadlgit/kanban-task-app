import { faker } from '@faker-js/faker';

import { BOARD_UNDEFINED_ERROR, FirebaseBoardRepository } from './firebase-board-repository';
import {
  getBoardDoc,
  getBoardRef,
  getBoardTaskDocs,
  getColumnTaskDocs,
  getPrevTaskRef,
  getTaskDoc,
  getTaskRef,
  getUserBoardDocs,
  newBoardRef,
  newColumnId,
  newTaskRef,
  startBatch,
} from './firestore-helpers';
import type { TaskDocSchema } from './firestore-helpers';
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

const mockGetColumnTaskDocs = getColumnTaskDocs as jest.MockedFunction<typeof getColumnTaskDocs>;
mockGetColumnTaskDocs.mockImplementation((boardId, columnId) => {
  const columnTaskDocs = getMockFirestoreBoardAndTaskDocs(boardId).taskDocs.filter(
    ({ id }) => id === columnId
  );
  return Promise.resolve(new FirestoreDocs(columnTaskDocs));
});

const mockGetTaskDoc = getTaskDoc as jest.MockedFunction<typeof getTaskDoc>;
mockGetTaskDoc.mockImplementation((boardId, taskId) => {
  const taskDoc =
    getMockFirestoreBoardAndTaskDocs(boardId).taskDocs.find(({ id }) => id === taskId) ??
    ({} as ReturnType<typeof getMockFirestoreBoardAndTaskDocs>['taskDocs'][0]);
  return Promise.resolve(new FirestoreDoc(taskDoc));
});

const mockGetBoardRef = getBoardRef as jest.MockedFunction<typeof getBoardRef>;
mockGetBoardRef.mockImplementation((boardId) => new FirestoreRef({ id: boardId }));

const mockMakeTaskRefId = (boardId: UniqueId, taskId: UniqueId) => boardId + '-' + taskId;

const mockGetTaskRef = getTaskRef as jest.MockedFunction<typeof getTaskRef>;
mockGetTaskRef.mockImplementation(
  (boardId, taskId) => new FirestoreRef({ id: mockMakeTaskRefId(boardId, taskId) })
);

const mockGetPrevTaskRef = getPrevTaskRef as jest.MockedFunction<typeof getPrevTaskRef>;
mockGetPrevTaskRef.mockImplementation((boardId, taskId) => {
  const prevTaskId = getMockFirestoreBoardAndTaskDocs(boardId).taskDocs.find(
    ({ data }) => data.nextId === taskId
  )?.id;
  return Promise.resolve(
    prevTaskId ? new FirestoreRef({ id: mockMakeTaskRefId(boardId, prevTaskId) }) : null
  );
});

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
    { desc: 'index undefined', testNewIndex: undefined },
    { desc: 'index at start', testNewIndex: 0 },
    { desc: 'index at middle', testNewIndex: 1 },
  ])('should handle $desc', async ({ testNewIndex }) => {
    const testUserId = faker.datatype.uuid();
    mockBoards = [
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
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
      testNewIndex !== undefined && testNewIndex >= 0 && testNewIndex < mockBoards.length
        ? testNewIndex
        : mockBoards.length;
    const testPrevBoardRef =
      testBoardIndex > 0 ? new FirestoreRef({ id: mockBoards[testBoardIndex - 1].id }) : undefined;
    mockNewBoardRef.mockImplementationOnce(() => testBoardRef);

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    const boardId = await repository.addBoard(testUserId, testBoard, testNewIndex);

    expect(boardId).toEqual(testBoardRef.id);
    const testNextBoardId =
      testBoardIndex < mockBoards.length - 1 ? mockBoards[testBoardIndex + 1].id : undefined;
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
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockBatchSet.mock.calls[0]).toEqual([testBoardRef, testBoardDocData]);
    if (testPrevBoardRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      expect(mockBatchUpdate.mock.calls[0]).toEqual([
        testPrevBoardRef,
        { nextId: testBoardRef.id },
      ]);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip('should throw when firestore board document is not complete', async () => {
    // throw ADD_BOARD_MISSING_DATA_ERROR => not testable right now
  });
});

describe('FirebaseBoardRepository.updateBoard()', () => {
  it('should handle name update', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoardUpdate = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
    };
    mockBoards = [{ id: testBoardUpdate.id, name: faker.lorem.words(), columns: [] }];
    const testBoardRef = new FirestoreRef({ id: testBoardUpdate.id });

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateBoard(testUserId, testBoardUpdate);

    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockBatchUpdate.mock.calls[0]).toEqual([testBoardRef, { name: testBoardUpdate.name }]);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip.each([
    {
      desc: 'deletion',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsDeleted: [{ id: faker.datatype.uuid() }],
      } as Parameters<FirebaseBoardRepository['updateBoard']>[1],
    },
    {
      desc: 'addition',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsKept: [{ isAdded: true, name: faker.lorem.words() }],
      } as Parameters<FirebaseBoardRepository['updateBoard']>[1],
    },
    {
      desc: 'name update',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsKept: [{ isAdded: false, id: faker.datatype.uuid(), name: faker.lorem.words() }],
      } as Parameters<FirebaseBoardRepository['updateBoard']>[1],
    },
    {
      desc: 'move',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsKept: [
          { isAdded: false, id: faker.datatype.uuid() },
          { isAdded: true, name: faker.lorem.words() },
          { isAdded: false, id: faker.datatype.uuid() },
        ],
      } as Parameters<FirebaseBoardRepository['updateBoard']>[1],
    },
  ])('should handle columns update: $desc', async ({ testBoardUpdate }) => {
    const testUserId = faker.datatype.uuid();
    const testBoard: BoardEntity = {
      id: testBoardUpdate.id,
      name: faker.lorem.words(),
      columns: [],
    };
    if (testBoardUpdate.columnsDeleted) {
      if (!testBoardUpdate.columnsKept) {
        testBoard.columns.push({ id: faker.datatype.uuid(), name: faker.lorem.words(), tasks: [] });
      }
      for (const elt of testBoardUpdate.columnsDeleted) {
        testBoard.columns.push({ id: elt.id, name: faker.lorem.words(), tasks: [] });
        if (!testBoardUpdate.columnsKept) {
          testBoard.columns.push({
            id: faker.datatype.uuid(),
            name: faker.lorem.words(),
            tasks: [],
          });
        }
      }
    }
    if (testBoardUpdate.columnsKept) {
      for (const elt of testBoardUpdate.columnsKept.filter(({ isAdded }) => !isAdded)) {
        testBoard.columns.push({
          id: elt.id ?? faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        });
      }
    }
    mockBoards = [testBoard];
    const testBoardRef = new FirestoreRef({ id: testBoardUpdate.id });

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateBoard(testUserId, testBoardUpdate);

    let testBoardUpdateColumns: BoardEntity['columns'] = [];
    if (testBoardUpdate.columnsKept) {
      const addedIdxList = testBoardUpdate.columnsKept
        .map(({ isAdded }, idx) => ({
          isAdded,
          idx,
        }))
        .filter(({ isAdded }) => isAdded)
        .map(({ idx }) => idx);
      testBoardUpdateColumns = testBoardUpdate.columnsKept.map(({ isAdded, id, name }, idx) => {
        const addedId: UniqueId = mockNewColumnId.mock.results[addedIdxList.indexOf(idx)]?.value;
        const prevName =
          testBoard.columns.find(({ id: columnId }) => columnId === id)?.name ??
          faker.lorem.words();
        return {
          id: isAdded ? addedId : id,
          name: name ?? prevName,
          tasks: [],
        };
      });
    }
    if (testBoardUpdate.columnsDeleted && testBoardUpdateColumns.length === 0) {
      const deletedIds = testBoardUpdate.columnsDeleted.map(({ id }) => id);
      testBoardUpdateColumns = testBoard.columns.filter(({ id }) => !deletedIds.includes(id));
    }
    const testBoardDocData = testBoardDataFactory(
      {
        id: testBoard.id,
        name: testBoard.name,
        columns: testBoardUpdateColumns,
      },
      undefined,
      testUserId
    ).boardDoc.data;
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockBatchUpdate.mock.calls[0]).toEqual([
      testBoardRef,
      { columns: testBoardDocData.columns },
    ]);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.each([
    { from: 'start', to: 'middle' },
    { from: 'start', to: 'end' },
    { from: 'middle', to: 'start' },
    { from: 'middle', to: 'end' },
    { from: 'end', to: 'start' },
    { from: 'end', to: 'middle' },
  ])('should handle move from $from to $to', async ({ from, to }) => {
    const testUserId = faker.datatype.uuid();
    mockBoards = [
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
    ];
    const indexes: Record<string, number> = { start: 0, middle: 1, end: 2 };
    const testIndex = indexes[from];
    const testNewIndex = indexes[to];
    const testBoardId = mockBoards[testIndex].id;
    const testBoardRef = new FirestoreRef({ id: testBoardId });
    const prevBoardBeforeRef =
      testIndex > 0 ? new FirestoreRef({ id: mockBoards[testIndex - 1].id }) : undefined;
    const nextBoardBeforeId =
      testIndex < mockBoards.length - 1 ? mockBoards[testIndex + 1].id : null;
    const prevBoardAfterRef =
      testNewIndex > 0 ? new FirestoreRef({ id: mockBoards[testNewIndex].id }) : undefined;
    const nextBoardAfterId =
      testNewIndex < mockBoards.length - 1 ? mockBoards[testNewIndex + 1].id : null;
    const expectedUpdates = [[testBoardRef, { nextId: nextBoardAfterId }]];
    if (prevBoardBeforeRef) {
      expectedUpdates.push([prevBoardBeforeRef, { nextId: nextBoardBeforeId }]);
    }
    if (prevBoardAfterRef) {
      expectedUpdates.push([prevBoardAfterRef, { nextId: testBoardId }]);
    }

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateBoard(testUserId, { id: testBoardId }, testNewIndex);

    expect(mockBatchUpdate).toHaveBeenCalledTimes(expectedUpdates.length);
    for (const param of mockBatchUpdate.mock.calls) {
      expect(expectedUpdates).toContainEqual(param);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });
});

describe('FirebaseBoardRepository.deleteBoard()', () => {
  it.each([
    {
      desc: 'board at start',
      testBoardListLength: 2,
      testIndex: 0,
      testBoard: {
        id: faker.datatype.uuid(),
        name: faker.lorem.words(),
        columns: [],
      },
    },
    {
      desc: 'board at middle',
      testBoardListLength: 3,
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
  ])('should handle $desc', async ({ testBoardListLength, testBoard, testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardIndex = testIndex ?? 0;
    mockBoards = [];
    for (let i = 0; i < (testBoardListLength ?? 1); i++) {
      mockBoards.push(
        i === testBoardIndex
          ? testBoard
          : { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] }
      );
    }
    const testBoardRef = new FirestoreRef({ id: testBoard.id });
    const testTaskRefs = testBoard.columns.flatMap(({ tasks }) =>
      tasks.map(({ id }) => new FirestoreRef({ id: mockMakeTaskRefId(testBoard.id, id) }))
    );
    const testPrevBoardRef =
      testBoardIndex > 0 ? new FirestoreRef({ id: mockBoards[testBoardIndex - 1].id }) : undefined;
    const testNextBoardId =
      testBoardIndex < mockBoards.length - 1 ? mockBoards[testBoardIndex + 1].id : null;

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.deleteBoard(testUserId, testBoard.id);

    expect(mockBatchDelete).toHaveBeenCalledTimes(1 + testTaskRefs.length);
    for (const expected of [testBoardRef, ...testTaskRefs]) {
      expect(mockBatchDelete.mock.calls).toContainEqual([expected]);
    }
    if (testPrevBoardRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      expect(mockBatchUpdate.mock.calls[0]).toEqual([
        testPrevBoardRef,
        { nextId: testNextBoardId },
      ]);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });
});

describe.skip('FirebaseBoardRepository.addTask()', () => {
  it.each([
    { desc: 'index undefined', testNewIndex: undefined },
    { desc: 'index at start', testNewIndex: 0 },
    { desc: 'index at middle', testNewIndex: 1 },
  ])('should handle $desc', async ({ testNewIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn = {
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
          subtasks: [],
        },
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [],
        },
      ],
    };
    mockBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [testColumn],
      },
    ];
    const testTask = {
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
    };
    const testTaskRef = new FirestoreRef({
      id: mockMakeTaskRefId(testBoardId, faker.datatype.uuid()),
    });
    const testTaskIndex =
      testNewIndex !== undefined && testNewIndex >= 0 && testNewIndex < testColumn.tasks.length
        ? testNewIndex
        : testColumn.tasks.length;
    const testPrevTaskRef =
      testTaskIndex > 0
        ? new FirestoreRef({
            id: mockMakeTaskRefId(testBoardId, testColumn.tasks[testTaskIndex - 1].id),
          })
        : undefined;
    mockNewTaskRef.mockImplementationOnce(() => testTaskRef);

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    const taskId = await repository.addTask(
      testUserId,
      testBoardId,
      testColumn.id,
      testTask,
      testNewIndex
    );

    expect(taskId).toEqual(testTaskRef.id);
    const testTaskDocData = {
      title: testTask.title,
      description: testTask.description,
      subtasks: testTask.subtasks,
      status: { id: testColumn.id, name: testColumn.name },
      nextId:
        testTaskIndex < testColumn.tasks.length - 1 ? testColumn.tasks[testTaskIndex + 1].id : null,
    };
    expect(mockBatchSet).toHaveBeenCalledTimes(1);
    expect(mockBatchSet.mock.calls[0]).toEqual([testTaskRef, testTaskDocData]);
    if (testPrevTaskRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      expect(mockBatchUpdate.mock.calls[0]).toEqual([testPrevTaskRef, { nextId: testTaskRef.id }]);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip('should throw when firestore task document is not complete', async () => {
    // throw ADD_TASK_MISSING_DATA_ERROR => not testable right now
  });
});

describe('FirebaseBoardRepository.updateTask()', () => {
  it.each([
    {
      desc: 'title update',
      testTaskUpdate: {
        id: faker.datatype.uuid(),
        title: faker.lorem.words(),
      },
    },
    {
      desc: 'description update',
      testTaskUpdate: {
        id: faker.datatype.uuid(),
        description: faker.lorem.words(),
      },
    },
    {
      desc: 'subtasks update',
      testTaskUpdate: {
        id: faker.datatype.uuid(),
        subtasks: [{ title: faker.lorem.words(), isCompleted: false }],
      },
    },
  ])('should handle $desc', async ({ testTaskUpdate }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [
        {
          id: testTaskUpdate.id,
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [],
        },
      ],
    };
    mockBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [testColumn],
      },
    ];

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateTask(testUserId, testBoardId, testColumn.id, testTaskUpdate);

    const testTaskRef = new FirestoreRef({
      id: mockMakeTaskRefId(testBoardId, testTaskUpdate.id),
    });
    const testTaskDocData: Partial<TaskDocSchema> = {};
    if (testTaskUpdate.title) {
      testTaskDocData.title = testTaskUpdate.title;
    }
    if (testTaskUpdate.description) {
      testTaskDocData.description = testTaskUpdate.description;
    }
    if (testTaskUpdate.subtasks) {
      testTaskDocData.subtasks = testTaskUpdate.subtasks;
    }
    expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
    expect(mockBatchUpdate.mock.calls[0]).toEqual([testTaskRef, testTaskDocData]);
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip.each([
    { from: 'start', to: 'middle' },
    { from: 'start', to: 'end' },
    { from: 'middle', to: 'start' },
    { from: 'middle', to: 'end' },
    { from: 'end', to: 'start' },
    { from: 'end', to: 'middle' },
  ])('should handle move in same column from $from to $to', async ({ from, to }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn = {
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
          subtasks: [],
        },
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [],
        },
      ],
    };
    mockBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [testColumn],
      },
    ];
    const indexes: Record<string, number> = { start: 0, middle: 1, end: 2 };
    const testIndex = indexes[from];
    const testNewIndex = indexes[to];
    const testTaskId = testColumn.tasks[testIndex].id;

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateTask(
      testUserId,
      testBoardId,
      testColumn.id,
      { id: testTaskId },
      testNewIndex
    );

    const testTaskRef = new FirestoreRef({
      id: mockMakeTaskRefId(testBoardId, testTaskId),
    });
    const prevTaskBeforeRef =
      testIndex > 0 ? new FirestoreRef({ id: testColumn.tasks[testIndex - 1].id }) : undefined;
    const nextTaskBeforeId =
      testIndex < testColumn.tasks.length - 1 ? testColumn.tasks[testIndex + 1].id : null;
    const prevTaskAfterRef =
      testNewIndex > 0 ? new FirestoreRef({ id: testColumn.tasks[testNewIndex].id }) : undefined;
    const nextTaskAfterId =
      testNewIndex < testColumn.tasks.length - 1 ? testColumn.tasks[testNewIndex + 1].id : null;
    const expectedUpdates = [[testTaskRef, { nextId: nextTaskAfterId }]];
    if (prevTaskBeforeRef) {
      expectedUpdates.push([prevTaskBeforeRef, { nextId: nextTaskBeforeId }]);
    }
    if (prevTaskAfterRef) {
      expectedUpdates.push([prevTaskAfterRef, { nextId: testTaskId }]);
    }
    expect(mockBatchUpdate).toHaveBeenCalledTimes(expectedUpdates.length);
    for (const param of mockBatchUpdate.mock.calls) {
      expect(expectedUpdates).toContainEqual(param);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });

  it.skip('should handle move to different column', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn = {
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
          subtasks: [],
        },
      ],
    };
    const testNewColumn = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [
        {
          id: faker.datatype.uuid(),
          title: faker.lorem.words(),
          description: faker.lorem.words(),
          subtasks: [],
        },
      ],
    };
    mockBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [testColumn, testNewColumn],
      },
    ];
    const testIndex = 1;
    const testNewIndex = 0;
    const testTaskId = testColumn.tasks[testIndex].id;

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.updateTask(
      testUserId,
      testBoardId,
      testNewColumn.id,
      { id: testTaskId },
      testNewIndex,
      testColumn.id
    );

    const testTaskRef = new FirestoreRef({
      id: mockMakeTaskRefId(testBoardId, testTaskId),
    });
    const prevTaskBeforeRef =
      testIndex > 0 ? new FirestoreRef({ id: testColumn.tasks[testIndex - 1].id }) : undefined;
    const nextTaskBeforeId =
      testIndex < testColumn.tasks.length - 1 ? testColumn.tasks[testIndex + 1].id : null;
    const prevTaskAfterRef =
      testNewIndex > 0 ? new FirestoreRef({ id: testNewColumn.tasks[testNewIndex].id }) : undefined;
    const nextTaskAfterId =
      testNewIndex < testNewColumn.tasks.length - 1
        ? testNewColumn.tasks[testNewIndex + 1].id
        : null;
    const expectedUpdates = [
      [
        testTaskRef,
        {
          status: { id: testNewColumn.id, name: testNewColumn.name },
          nextId: nextTaskAfterId,
        } as Partial<TaskDocSchema>,
      ],
    ];
    if (prevTaskBeforeRef) {
      expectedUpdates.push([prevTaskBeforeRef, { nextId: nextTaskBeforeId }]);
    }
    if (prevTaskAfterRef) {
      expectedUpdates.push([prevTaskAfterRef, { nextId: testTaskId }]);
    }
    expect(mockBatchUpdate).toHaveBeenCalledTimes(expectedUpdates.length);
    for (const param of mockBatchUpdate.mock.calls) {
      expect(expectedUpdates).toContainEqual(param);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });
});

describe('FirebaseBoardRepository.deleteTask()', () => {
  it.each([
    {
      desc: 'task at start',
      testTaskListLength: 2,
      testIndex: 0,
    },
    {
      desc: 'task at middle',
      testTaskListLength: 3,
      testIndex: 1,
    },
  ])('should handle $desc', async ({ testTaskListLength, testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn: BoardEntity['columns'][0] = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [],
    };
    const testTaskIndex = testIndex;
    for (let i = 0; i < testTaskListLength; i++) {
      testColumn.tasks.push({
        id: faker.datatype.uuid(),
        title: faker.lorem.words(),
        description: faker.lorem.words(),
        subtasks: [],
      });
    }
    const testTask = testColumn.tasks[testIndex];
    mockBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [testColumn],
      },
    ];

    const repository = new FirebaseBoardRepository();
    await repository.getBoardList(testUserId);
    await repository.deleteTask(testUserId, testBoardId, testColumn.id, testTask.id);

    const testTaskRef = new FirestoreRef({
      id: mockMakeTaskRefId(testBoardId, testTask.id),
    });
    const testPrevTaskRef =
      testTaskIndex > 0
        ? new FirestoreRef({
            id: mockMakeTaskRefId(testBoardId, testColumn.tasks[testTaskIndex - 1].id),
          })
        : undefined;
    const testNextTaskId =
      testTaskIndex < testColumn.tasks.length - 1 ? testColumn.tasks[testTaskIndex + 1].id : null;
    expect(mockBatchDelete).toHaveBeenCalledTimes(1);
    expect(mockBatchDelete.mock.calls[0]).toEqual([testTaskRef]);
    if (testPrevTaskRef) {
      expect(mockBatchUpdate).toHaveBeenCalledTimes(1);
      expect(mockBatchUpdate.mock.calls[0]).toEqual([testPrevTaskRef, { nextId: testNextTaskId }]);
    }
    expect(mockBatchCommit).toHaveBeenCalledTimes(1);
  });
});
