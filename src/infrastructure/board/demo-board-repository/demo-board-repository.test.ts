import { faker } from '@faker-js/faker';

import { DemoBoardRepository } from './demo-board-repository';
import { getInitialBoards } from './initial-boards';
import type { BoardEntity } from 'core/entities';

jest.mock('./initial-boards');

const mockGetInitialBoards = getInitialBoards as jest.MockedFunction<typeof getInitialBoards>;
mockGetInitialBoards.mockImplementation(() => []);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DemoBoardRepository.getBoardList()', () => {
  it('should return board list', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoards = [
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
    ];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);
    const expectedList = testBoards.map(({ id, name }) => ({ id, name }));

    const result = await new DemoBoardRepository().getBoardList(testUserId);

    expect(result).toEqual(expectedList);
  });
});

describe('DemoBoardRepository.getBoard()', () => {
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
    mockGetInitialBoards.mockImplementationOnce(() => [{ ...testBoard }]);

    const result = await new DemoBoardRepository().getBoard(testUserId, testBoard.id);

    expect(result).toEqual(testBoard);
  });
});

describe('DemoBoardRepository.addBoard()', () => {
  it.each([
    { desc: 'index undefined', testNewIndex: undefined },
    { desc: 'index at start', testNewIndex: 0 },
    { desc: 'index at middle', testNewIndex: 1 },
  ])('should handle $desc', async ({ testNewIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoards = [
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
    const testBoardIndex =
      testNewIndex !== undefined && testNewIndex >= 0 && testNewIndex < testBoards.length
        ? testNewIndex
        : testBoards.length;
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    const boardId = await repository.addBoard(testUserId, testBoard, testNewIndex);

    expect(boardId).toBeDefined();
    const board = await repository.getBoard(testUserId, boardId);
    for (let i = 0; i < testBoard.columns.length; i++) {
      expect(board.columns[i].id).toBeDefined();
      expect(board.columns[i].name).toEqual(testBoard.columns[i].name);
    }

    const boardList = await repository.getBoardList(testUserId);
    expect(boardList.length).toEqual(testBoards.length + 1);
    for (let i = 0; i < testBoardIndex; i++) {
      const { id, name } = testBoards[i];
      expect(boardList[i]).toEqual({ id, name });
    }
    expect(boardList[testBoardIndex]).toEqual({ id: board.id, name: testBoard.name });
    for (let i = testBoardIndex + 1; i < boardList.length; i++) {
      const { id, name } = testBoards[i - 1];
      expect(boardList[i]).toEqual({ id, name });
    }
  });
});

describe('DemoBoardRepository.updateBoard()', () => {
  it('should handle name update', async () => {
    const testUserId = faker.datatype.uuid();
    const testBoardUpdate = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
    };
    mockGetInitialBoards.mockImplementationOnce(() => [
      { id: testBoardUpdate.id, name: faker.lorem.words(), columns: [] },
    ]);

    const repository = new DemoBoardRepository();
    await repository.updateBoard(testUserId, testBoardUpdate);

    const board = await repository.getBoard(testUserId, testBoardUpdate.id);
    expect(board.name).toEqual(testBoardUpdate.name);
  });

  it.each([
    {
      desc: 'deletion',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsDeleted: [{ id: faker.datatype.uuid() }],
      } as Parameters<DemoBoardRepository['updateBoard']>[1],
    },
    {
      desc: 'addition',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsKept: [{ isAdded: true, name: faker.lorem.words() }],
      } as Parameters<DemoBoardRepository['updateBoard']>[1],
    },
    {
      desc: 'name update',
      testBoardUpdate: {
        id: faker.datatype.uuid(),
        columnsKept: [{ isAdded: false, id: faker.datatype.uuid(), name: faker.lorem.words() }],
      } as Parameters<DemoBoardRepository['updateBoard']>[1],
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
      } as Parameters<DemoBoardRepository['updateBoard']>[1],
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
    mockGetInitialBoards.mockImplementationOnce(() => [{ ...testBoard }]);

    const repository = new DemoBoardRepository();
    await repository.updateBoard(testUserId, testBoardUpdate);

    const board = await repository.getBoard(testUserId, testBoardUpdate.id);
    if (testBoardUpdate.columnsKept) {
      for (let i = 0; i < testBoardUpdate.columnsKept.length; i++) {
        const { isAdded, id, name } = testBoardUpdate.columnsKept[i];
        if (isAdded) {
          expect(board.columns[i].id).toBeDefined();
          expect(board.columns[i].name).toEqual(name);
        } else {
          const before = testBoard.columns.find(({ id: idBefore }) => idBefore === id);
          expect(before).toBeDefined();
          expect(board.columns[i].id).toEqual(id);
          expect(board.columns[i].name).toEqual(name ?? before?.name);
        }
      }
    } else {
      if (testBoardUpdate.columnsDeleted) {
        expect(board.columns).toEqual(
          testBoard.columns.filter(({ id }) => !testBoardUpdate.columnsDeleted?.includes({ id }))
        );
      }
    }
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
    const testBoards = [
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
      { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
    ];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);
    const indexes: Record<string, number> = { start: 0, middle: 1, end: 2 };
    const testIndex = indexes[from];
    const testNewIndex = indexes[to];
    const testBoard = testBoards[testIndex];

    const repository = new DemoBoardRepository();
    await repository.updateBoard(testUserId, { id: testBoard.id }, testNewIndex);

    const boardList = await repository.getBoardList(testUserId);
    const filteredBoards = testBoards.filter((elt, idx) => idx !== testIndex);
    const expectedList = [
      ...filteredBoards.slice(0, testNewIndex),
      testBoard,
      ...filteredBoards.slice(testNewIndex),
    ].map(({ id, name }) => ({ id, name }));
    expect(boardList).toEqual(expectedList);
  });
});

describe('DemoBoardRepository.deleteBoard()', () => {
  it.each([
    {
      desc: 'board at start',
      testBoardListLength: 2,
      testIndex: 0,
    },
    {
      desc: 'board at middle',
      testBoardListLength: 3,
      testIndex: 1,
    },
    {
      desc: 'board at end',
      testBoardListLength: 3,
      testIndex: 2,
    },
  ])('should handle $desc', async ({ testBoardListLength, testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardIndex = testIndex ?? 0;
    const testBoard = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      columns: [],
    };
    const testBoards: BoardEntity[] = [];
    for (let i = 0; i < (testBoardListLength ?? 1); i++) {
      testBoards.push(
        i === testBoardIndex
          ? testBoard
          : { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] }
      );
    }
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    await repository.deleteBoard(testUserId, testBoard.id);

    const boardList = await repository.getBoardList(testUserId);
    expect(boardList.length).toEqual(testBoards.length - 1);
    expect(boardList).toEqual(
      testBoards.filter(({ id }) => id !== testBoard.id).map(({ id, name }) => ({ id, name }))
    );
  });
});

describe('DemoBoardRepository.addTask()', () => {
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
    const testBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [{ ...testColumn, tasks: [...testColumn.tasks] }],
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
    const testTaskIndex =
      testNewIndex !== undefined && testNewIndex >= 0 && testNewIndex < testColumn.tasks.length
        ? testNewIndex
        : testColumn.tasks.length;
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    const taskId = await repository.addTask(
      testUserId,
      testBoardId,
      testColumn.id,
      testTask,
      testNewIndex
    );

    expect(taskId).toBeDefined();
    const board = await repository.getBoard(testUserId, testBoardId);

    const tasks = board.columns[0].tasks;
    expect(tasks.length).toEqual(testColumn.tasks.length + 1);
    for (let i = 0; i < testTaskIndex; i++) {
      expect(tasks[i]).toEqual(testColumn.tasks[i]);
    }
    expect(tasks[testTaskIndex]).toEqual({ ...testTask, id: taskId });
    for (let i = testTaskIndex + 1; i < tasks.length; i++) {
      expect(tasks[i]).toEqual(testColumn.tasks[i - 1]);
    }

    const task = tasks.find(({ id }) => id === taskId);
    expect(task).toBeDefined();
    if (task) {
      expect(task.title).toEqual(testTask.title);
      expect(task.description).toEqual(testTask.description);
      expect(task.subtasks).toEqual(testTask.subtasks);
    }
  });
});

describe('DemoBoardRepository.updateTask()', () => {
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
    const testTask = {
      id: testTaskUpdate.id,
      title: faker.lorem.words(),
      description: faker.lorem.words(),
      subtasks: [],
    };
    const testColumn = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [{ ...testTask }],
    };
    const testBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [{ ...testColumn, tasks: [...testColumn.tasks] }],
      },
    ];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    await repository.updateTask(testUserId, testBoardId, testColumn.id, testTaskUpdate);

    const board = await repository.getBoard(testUserId, testBoardId);
    const task = board.columns[0].tasks.find(({ id }) => id === testTaskUpdate.id);
    expect(task).toBeDefined();
    if (task) {
      expect(task.title).toEqual(testTaskUpdate.title ?? testTask.title);
      expect(task.description).toEqual(testTaskUpdate.description ?? testTask.description);
      expect(task.subtasks).toEqual(testTaskUpdate.subtasks ?? testTask.subtasks);
    }
  });

  it.each([
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

    const testBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [{ ...testColumn, tasks: [...testColumn.tasks] }],
      },
    ];
    const indexes: Record<string, number> = { start: 0, middle: 1, end: 2 };
    const testIndex = indexes[from];
    const testNewIndex = indexes[to];
    const testTask = testColumn.tasks[testIndex];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    await repository.updateTask(
      testUserId,
      testBoardId,
      testColumn.id,
      { id: testTask.id },
      testNewIndex
    );

    const board = await repository.getBoard(testUserId, testBoardId);
    const tasks = board.columns[0].tasks;
    const filteredTasks = testColumn.tasks.filter((elt, idx) => idx !== testIndex);
    const expectedTasks = [
      ...filteredTasks.slice(0, testNewIndex),
      testTask,
      ...filteredTasks.slice(testNewIndex),
    ];
    expect(tasks).toEqual(expectedTasks);
  });

  it('should handle move to different column', async () => {
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
    const testBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [
          { ...testColumn, tasks: [...testColumn.tasks] },
          { ...testNewColumn, tasks: [...testNewColumn.tasks] },
        ],
      },
    ];
    const testIndex = 1;
    const testNewIndex = 0;
    const testTask = testColumn.tasks[testIndex];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    await repository.updateTask(
      testUserId,
      testBoardId,
      testNewColumn.id,
      { id: testTask.id },
      testNewIndex,
      testColumn.id
    );

    const board = await repository.getBoard(testUserId, testBoardId);
    const columnTasks = board.columns[0].tasks;
    const newColumnTasks = board.columns[1].tasks;
    expect(columnTasks.length).toEqual(testColumn.tasks.length - 1);
    expect(newColumnTasks.length).toEqual(testNewColumn.tasks.length + 1);
    expect(columnTasks).toEqual(testColumn.tasks.filter(({ id }) => id !== testTask.id));
    expect(newColumnTasks).toEqual([testTask, ...testNewColumn.tasks]);
  });
});

describe('DemoBoardRepository.deleteTask()', () => {
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
    {
      desc: 'task at end',
      testTaskListLength: 3,
      testIndex: 2,
    },
  ])('should handle $desc', async ({ testTaskListLength, testIndex }) => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testColumn: BoardEntity['columns'][0] = {
      id: faker.datatype.uuid(),
      name: faker.lorem.words(),
      tasks: [],
    };
    for (let i = 0; i < testTaskListLength; i++) {
      testColumn.tasks.push({
        id: faker.datatype.uuid(),
        title: faker.lorem.words(),
        description: faker.lorem.words(),
        subtasks: [],
      });
    }
    const testBoards = [
      {
        id: testBoardId,
        name: faker.lorem.words(),
        columns: [{ ...testColumn, tasks: [...testColumn.tasks] }],
      },
    ];
    const testTask = testColumn.tasks[testIndex];
    mockGetInitialBoards.mockImplementationOnce(() => [...testBoards]);

    const repository = new DemoBoardRepository();
    await repository.deleteTask(testUserId, testBoardId, testColumn.id, testTask.id);

    const board = await repository.getBoard(testUserId, testBoardId);
    const tasks = board.columns[0].tasks;
    expect(tasks.length).toEqual(testColumn.tasks.length - 1);
    expect(tasks).toEqual(testColumn.tasks.filter(({ id }) => id !== testTask.id));
  });
});
