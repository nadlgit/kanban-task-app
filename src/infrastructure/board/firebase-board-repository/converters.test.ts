import { faker } from '@faker-js/faker';

import {
  boardToFirestoreDoc,
  BOARD_TO_DOC_MISSING_DATA_ERROR,
  firestoreDocToBoardBase,
  firestoreDocsToBoardColumnTasks,
  firestoreDocsToBoardList,
  firestorePartsToBoard,
  taskToFirestoreDoc,
  TASK_TO_DOC_MISSING_DATA_ERROR,
} from './converters';
import { emptyFirestoreDocs, FirestoreDoc, FirestoreDocs } from './test-utils';

describe('firestoreDocsToBoardList()', () => {
  it('should handle empty board collection', () => {
    const result = firestoreDocsToBoardList(emptyFirestoreDocs());
    expect(result).toEqual([]);
  });

  it('should handle non empty board collection', () => {
    const testUserId = faker.datatype.uuid();
    const testBoards = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
    const testData = testBoards.map(({ id, name }, idx) => ({
      id,
      data: {
        owner: testUserId,
        name,
        columns: {},
        nextId: idx < testBoards.length - 1 ? testBoards[idx + 1].id : null,
      },
    }));
    const expected = testBoards.map(({ id, name }) => ({ id, name }));

    const result = firestoreDocsToBoardList(new FirestoreDocs(testData));
    expect(result).toEqual(expected);
  });
});

describe('firestoreDocToBoardBase()', () => {
  it('should handle board document', () => {
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
              subtasks: [],
            },
          ],
        },
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
      ],
    };
    const testData = {
      id: testBoard.id,
      data: {
        owner: faker.datatype.uuid(),
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
    const expected = {
      ...testBoard,
      columns: testBoard.columns.map(({ id, name }) => ({ id, name })),
    };

    const result = firestoreDocToBoardBase(new FirestoreDoc(testData));
    expect(result).toEqual(expected);
  });
});

describe('firestoreDocsToBoardColumnTasks()', () => {
  it('should handle task collection', () => {
    const testBoardColumns = [
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
            subtasks: [],
          },
          {
            id: faker.datatype.uuid(),
            title: faker.lorem.words(),
            description: faker.lorem.words(),
            subtasks: [],
          },
        ],
      },
    ];
    const testData = testBoardColumns.flatMap(({ id, name, tasks }) =>
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
    const expected = Object.fromEntries(testBoardColumns.map(({ id, tasks }) => [id, tasks]));

    const result = firestoreDocsToBoardColumnTasks(new FirestoreDocs(testData));
    expect(result).toEqual(expected);
  });
});

describe('firestorePartsToBoard()', () => {
  it('should convert', () => {
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
              subtasks: [],
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
              subtasks: [],
            },
            {
              id: faker.datatype.uuid(),
              title: faker.lorem.words(),
              description: faker.lorem.words(),
              subtasks: [],
            },
          ],
        },
      ],
    };
    const testBoardBase = {
      ...testBoard,
      columns: testBoard.columns.map(({ id, name }) => ({ id, name })),
    };
    const testColumnTasks = Object.fromEntries(
      testBoard.columns.map(({ id, tasks }) => [id, tasks])
    );

    const result = firestorePartsToBoard(testBoardBase, testColumnTasks);
    expect(result).toEqual(testBoard);
  });
});

describe('boardToFirestoreDoc()', () => {
  it.each([
    { desc: 'no field provided', testData: {} },
    { desc: 'only name provided', testData: { name: faker.lorem.words() } },
  ])('should throw when all fields required and $desc', ({ testData }) => {
    expect(() => boardToFirestoreDoc(testData, true)).toThrow(BOARD_TO_DOC_MISSING_DATA_ERROR);
  });

  it('should handle no field provided', () => {
    const testData = {};
    const expected = {
      boardDoc: {},
      hasNoField: true,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle all fields provided', () => {
    const testData = {
      name: faker.lorem.words(),
      columns: [
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
      ],
      userId: faker.datatype.uuid(),
      nextBoardId: faker.datatype.uuid(),
    };
    const expected = {
      boardDoc: {
        owner: testData.userId,
        name: testData.name,
        columns: Object.fromEntries(
          testData.columns.map(({ id, name }, idx) => [
            id,
            {
              name,
              nextId: idx < testData.columns.length - 1 ? testData.columns[idx + 1].id : null,
            },
          ])
        ),
        nextId: testData.nextBoardId,
      },
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only name provided', () => {
    const testData = { name: faker.lorem.words() };
    const expected = {
      boardDoc: { name: testData.name },
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only columns provided', () => {
    const testData = {
      columns: [
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
        {
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          tasks: [],
        },
      ],
    };
    const expected = {
      boardDoc: {
        columns: Object.fromEntries(
          testData.columns.map(({ id, name }, idx) => [
            id,
            {
              name,
              nextId: idx < testData.columns.length - 1 ? testData.columns[idx + 1].id : null,
            },
          ])
        ),
      },
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only userId provided', () => {
    const testData = { userId: faker.datatype.uuid() };
    const expected = {
      boardDoc: { owner: testData.userId },
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only nextBoardId provided', () => {
    const testData = { nextBoardId: faker.datatype.uuid() };
    const expected = {
      boardDoc: { nextId: testData.nextBoardId },
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });
});

describe('taskToFirestoreDoc()', () => {
  it.each([
    { desc: 'no field provided', testData: {} },
    { desc: 'only title provided', testData: { title: faker.lorem.words() } },
  ])('should throw when all fields required and $desc', ({ testData }) => {
    expect(() => taskToFirestoreDoc(testData, true)).toThrow(TASK_TO_DOC_MISSING_DATA_ERROR);
  });

  it('should handle no field provided', () => {
    const testData = {};
    const expected = {
      taskDoc: {},
      hasNoField: true,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle all fields provided', () => {
    const testData = {
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
      column: { id: faker.datatype.uuid(), name: faker.lorem.words() },
      nextTaskId: faker.datatype.uuid(),
    };
    const expected = {
      taskDoc: {
        title: testData.title,
        description: testData.description,
        subtasks: testData.subtasks,
        status: testData.column,
        nextId: testData.nextTaskId,
      },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only title provided', () => {
    const testData = { title: faker.lorem.words() };
    const expected = {
      taskDoc: { title: testData.title },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only description provided', () => {
    const testData = { description: faker.lorem.words() };
    const expected = {
      taskDoc: { description: testData.description },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only subtasks provided', () => {
    const testData = {
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
    const expected = {
      taskDoc: { subtasks: testData.subtasks },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only column provided', () => {
    const testData = { column: { id: faker.datatype.uuid(), name: faker.lorem.words() } };
    const expected = {
      taskDoc: { status: testData.column },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only nextTaskId provided', () => {
    const testData = { nextTaskId: faker.datatype.uuid() };
    const expected = {
      taskDoc: { nextId: testData.nextTaskId },
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });
});
