import { faker } from '@faker-js/faker';
import { BoardEntity, BoardList, UniqueId } from 'core/entities';

import {
  boardToFirestoreDoc,
  firestoreDocsToBoard,
  firestoreDocsToBoardList,
  taskToFirestoreDoc,
} from './converters';
import { BoardDocSchema, TaskDocSchema } from './firestore-helpers';
import { FirestoreDoc, FirestoreDocs } from './test-utils';

const testBoardDataFactory = (board: BoardEntity, nextBoardId?: UniqueId, userId?: UniqueId) => {
  const boardDoc: { id: string; data: BoardDocSchema } = {
    id: board.id,
    data: {
      owner: userId ?? faker.datatype.uuid(),
      name: board.name,
      columns: {},
      nextId: nextBoardId ?? null,
    },
  };
  const taskDocs: { id: string; data: TaskDocSchema }[] = [];

  board.columns.forEach(({ id: columnId, name: columnName, tasks }, columnIdx) => {
    const nextColumnId =
      columnIdx < board.columns.length - 1 ? board.columns[columnIdx + 1].id : null;
    boardDoc.data.columns[columnId] = { name: columnName, nextId: nextColumnId };
    tasks.forEach(({ id: taskId, title, description, subtasks }, taskIdx) => {
      const nextTaskId = taskIdx < tasks.length - 1 ? tasks[taskIdx + 1].id : null;
      taskDocs.push({
        id: taskId,
        data: {
          title,
          description,
          subtasks,
          status: { id: columnId, name: columnName },
          nextId: nextTaskId,
        },
      });
    });
  });

  return { board, boardDoc, taskDocs };
};

const testBoardListDataFactory = (boardList: BoardList) => {
  const boardDocs: { id: string; data: BoardDocSchema }[] = [];
  boardList.forEach(({ id, name }, idx) => {
    const nextId = idx < boardList.length - 1 ? boardList[idx + 1].id : undefined;
    const { boardDoc } = testBoardDataFactory({ id, name, columns: [] }, nextId);
    boardDocs.push(boardDoc);
  });
  return { boardList, boardDocs };
};

describe('firestoreDocsToBoardList()', () => {
  it('should handle empty board collection', () => {
    const testData = testBoardListDataFactory([]);
    const boardDocs = new FirestoreDocs(testData.boardDocs);
    const expected = testData.boardList;

    const result = firestoreDocsToBoardList(boardDocs);
    expect(result).toEqual(expected);
  });

  it('should handle non empty board collection', () => {
    const testData = testBoardListDataFactory([
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ]);
    const boardDocs = new FirestoreDocs(testData.boardDocs);
    const expected = testData.boardList;

    const result = firestoreDocsToBoardList(boardDocs);
    expect(result).toEqual(expected);
  });
});

describe('firestoreDocsToBoard()', () => {
  it.each([
    { desc: 'boardBefore undefined', boardBefore: undefined },
    {
      desc: 'boardBefore defined',
      boardBefore: {
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
        ],
      },
    },
  ])('should handle $desc / boardDoc defined / taskDocs defined', ({ boardBefore }) => {
    const testData = testBoardDataFactory({
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
      ],
    });
    const boardDoc = new FirestoreDoc(testData.boardDoc);
    const taskDocs = new FirestoreDocs(testData.taskDocs);
    const expected = testData.board;

    const result = firestoreDocsToBoard({ boardBefore, boardDoc }, taskDocs);
    expect(result).toEqual(expected);
  });

  it('should handle boardBefore defined / boardDoc undefined / taskDocs undefined', () => {
    const boardBefore = {
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
      ],
    };
    const boardDoc = undefined;
    const taskDocs = undefined;
    const expected = boardBefore;

    const result = firestoreDocsToBoard({ boardBefore, boardDoc }, taskDocs);
    expect(result).toEqual(expected);
  });

  it('should handle boardBefore undefined / boardDoc defined / taskDocs undefined', () => {
    const testData = testBoardDataFactory({
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
      ],
    });
    const boardBefore = undefined;
    const boardDoc = new FirestoreDoc(testData.boardDoc);
    const taskDocs = undefined;
    const expected = {
      ...testData.board,
      columns: testData.board.columns.map(({ id, name }) => ({ id, name, tasks: [] })),
    };

    const result = firestoreDocsToBoard({ boardBefore, boardDoc }, taskDocs);
    expect(result).toEqual(expected);
  });

  it('should handle boardBefore defined / boardDoc defined / taskDocs undefined', () => {
    const testData = testBoardDataFactory({
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
    });
    const boardBefore = {
      id: testData.board.id,
      name: faker.lorem.words(),
      columns: [
        testData.board.columns[0],
        {
          id: testData.board.columns[1].id,
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
      ],
    };
    const boardDoc = new FirestoreDoc(testData.boardDoc);
    const taskDocs = undefined;
    const expected = {
      ...testData.board,
      columns: testData.board.columns.map(({ id, name }) => {
        const columnBefore = boardBefore.columns.find(({ id: idBefore }) => idBefore === id);
        return { id, name, tasks: columnBefore ? columnBefore.tasks : [] };
      }),
    };

    const result = firestoreDocsToBoard({ boardBefore, boardDoc }, taskDocs);
    expect(result).toEqual(expected);
  });

  it('should handle boardBefore defined / boardDoc undefined / taskDocs defined ', () => {
    const testData = testBoardDataFactory({
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
    });
    const boardBefore = {
      id: testData.board.id,
      name: faker.lorem.words(),
      columns: [
        testData.board.columns[0],
        {
          id: testData.board.columns[1].id,
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
      ],
    };
    const boardDoc = undefined;
    const taskDocs = new FirestoreDocs(testData.taskDocs);
    const expected = {
      ...boardBefore,
      columns: boardBefore.columns.map(({ id, name, tasks }) => {
        const columnAfter = testData.board.columns.find(({ id: iAfter }) => iAfter === id);
        return { id, name, tasks: columnAfter ? columnAfter.tasks : tasks };
      }),
    };

    const result = firestoreDocsToBoard({ boardBefore, boardDoc }, taskDocs);
    expect(result).toEqual(expected);
  });
});

describe('boardToFirestoreDoc()', () => {
  it('should handle no field provided', () => {
    const testData = {};
    const expected = {
      boardDoc: {},
      hasAllFields: false,
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
        columns: testBoardDataFactory({
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          columns: testData.columns,
        }).boardDoc.data.columns,
        nextId: testData.nextBoardId,
      },
      hasAllFields: true,
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only name provided', () => {
    const testData = { name: faker.lorem.words() };
    const expected = {
      boardDoc: { name: testData.name },
      hasAllFields: false,
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
        columns: testBoardDataFactory({
          id: faker.datatype.uuid(),
          name: faker.lorem.words(),
          columns: testData.columns,
        }).boardDoc.data.columns,
      },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only userId provided', () => {
    const testData = { userId: faker.datatype.uuid() };
    const expected = {
      boardDoc: { owner: testData.userId },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only nextBoardId provided', () => {
    const testData = { nextBoardId: faker.datatype.uuid() };
    const expected = {
      boardDoc: { nextId: testData.nextBoardId },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = boardToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });
});

describe('taskToFirestoreDoc()', () => {
  it('should handle no field provided', () => {
    const testData = {};
    const expected = {
      taskDoc: {},
      hasAllFields: false,
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
      hasAllFields: true,
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only title provided', () => {
    const testData = { title: faker.lorem.words() };
    const expected = {
      taskDoc: { title: testData.title },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only description provided', () => {
    const testData = { description: faker.lorem.words() };
    const expected = {
      taskDoc: { description: testData.description },
      hasAllFields: false,
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
      hasAllFields: false,
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only column provided', () => {
    const testData = { column: { id: faker.datatype.uuid(), name: faker.lorem.words() } };
    const expected = {
      taskDoc: { status: testData.column },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });

  it('should handle only nextTaskId provided', () => {
    const testData = { nextTaskId: faker.datatype.uuid() };
    const expected = {
      taskDoc: { nextId: testData.nextTaskId },
      hasAllFields: false,
      hasNoField: false,
    };

    const result = taskToFirestoreDoc(testData);
    expect(result).toEqual(expected);
  });
});
