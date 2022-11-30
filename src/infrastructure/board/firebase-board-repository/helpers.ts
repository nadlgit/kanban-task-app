import {
  getBoardDoc,
  getBoardTaskDocs,
  getColumnTaskDocs,
  getPrevTaskRef,
  getTaskDoc,
} from './firestore-helpers';
import type { BoardDocSchema, NextId, TaskDocSchema } from './firestore-helpers';
import type { BoardEntity, BoardList, UniqueId } from 'core/entities';

export function getBoardInfo(
  infoType: Record<'prevIdAfter' | 'nextIdAfter' | 'prevIdBefore' | 'nextIdBefore', boolean>,
  context: {
    boardId: UniqueId;
    boardList: BoardList;
    indexAfter?: number;
  }
) {
  const { boardId, boardList, indexAfter } = context;

  let prevIdAfter: NextId = null;
  let nextIdAfter: NextId = null;
  let prevIdBefore: NextId = null;
  let nextIdBefore: NextId = null;
  const computedIndexAfter =
    indexAfter !== undefined && indexAfter >= 0 && indexAfter < boardList.length
      ? indexAfter
      : boardList.length - 1;
  if (computedIndexAfter > 0) {
    prevIdAfter = boardList[computedIndexAfter - 1].id;
  }
  if (computedIndexAfter < boardList.length - 1) {
    nextIdAfter = boardList[computedIndexAfter + 1].id;
  }
  const indexBefore = boardList.findIndex(({ id }) => id === boardId);
  if (indexBefore > 0) {
    prevIdBefore = boardList[indexBefore - 1].id;
  }
  if (indexBefore < boardList.length - 1) {
    nextIdBefore = boardList[indexBefore + 1].id;
  }

  return {
    prevIdAfter: infoType.prevIdAfter ? prevIdAfter : undefined,
    nextIdAfter: infoType.nextIdAfter ? nextIdAfter : undefined,
    prevIdBefore: infoType.prevIdBefore ? prevIdBefore : undefined,
    nextIdBefore: infoType.nextIdBefore ? nextIdBefore : undefined,
  };
}

export async function getBoardColumns(boardId: UniqueId, board?: BoardEntity) {
  const boardColumns: { id: UniqueId; name: string }[] = [];

  if (board && board.id === boardId) {
    boardColumns.push(...board.columns.map(({ id, name }) => ({ id, name })));
  } else {
    const boardDoc = await getBoardDoc(boardId);
    const { columns } = boardDoc.data() as BoardDocSchema;
    Object.entries(columns).forEach(([key, { name, nextId }]) => {
      const index = Math.max(
        0,
        boardColumns.findIndex(({ id }) => id === nextId)
      );
      boardColumns.splice(index, 0, { id: key, name });
    });
  }

  return boardColumns;
}

export async function getBoardTaskIds(boardId: UniqueId, board?: BoardEntity) {
  const tasksIds: UniqueId[] = [];

  if (board && board.id === boardId) {
    tasksIds.push(
      ...board.columns
        .map(({ tasks }) => tasks)
        .flat()
        .map(({ id }) => id)
    );
  } else {
    const tasksDocs = await getBoardTaskDocs(boardId);
    tasksDocs.forEach(({ id }) => {
      tasksIds.push(id);
    });
  }

  return tasksIds;
}

export async function getColumnTaskIds(boardId: UniqueId, columnId: UniqueId, board?: BoardEntity) {
  const tasksIds: UniqueId[] = [];

  const column = board?.columns.find(({ id }) => id === columnId);
  if (board && board.id === boardId && column) {
    tasksIds.push(...column.tasks.map(({ id }) => id));
  } else {
    const tasksDocs = await getColumnTaskDocs(boardId, columnId);
    tasksDocs.forEach(({ id }) => {
      tasksIds.push(id);
    });
  }

  return tasksIds;
}

export async function getTaskInfo(
  infoType: Record<
    'statusAfter' | 'prevIdAfter' | 'nextIdAfter' | 'prevIdBefore' | 'nextIdBefore',
    boolean
  >,
  context: {
    taskId: UniqueId;
    boardId: UniqueId;
    columnIdBefore: UniqueId;
    columnIdAfter: UniqueId;
    board?: BoardEntity;
    indexAfter?: number;
  }
) {
  const { taskId, boardId, columnIdBefore, columnIdAfter, board, indexAfter } = context;

  let statusAfter: TaskDocSchema['status'] | undefined = undefined;
  let prevIdAfter: NextId = null;
  let nextIdAfter: NextId = null;
  let prevIdBefore: NextId = null;
  let nextIdBefore: NextId = null;
  const columnBefore = board?.columns.find(({ id }) => id === columnIdBefore);
  const columnAfter =
    columnIdAfter === columnIdBefore
      ? columnBefore
      : board?.columns.find(({ id }) => id === columnIdAfter);
  if (board && board.id === boardId && columnBefore && columnAfter) {
    statusAfter = { id: columnAfter.id, name: columnAfter.name };
    const computedIndexAfter =
      indexAfter !== undefined && indexAfter >= 0 && indexAfter < columnAfter.tasks.length
        ? indexAfter
        : columnAfter.tasks.length - 1;
    if (computedIndexAfter > 0) {
      prevIdAfter = columnAfter.tasks[computedIndexAfter - 1].id;
    }
    if (computedIndexAfter < columnAfter.tasks.length - 1) {
      nextIdAfter = columnAfter.tasks[computedIndexAfter + 1].id;
    }
    const indexBefore = columnBefore.tasks.findIndex(({ id }) => id === taskId);
    if (indexBefore > 0) {
      prevIdBefore = columnBefore.tasks[indexBefore - 1].id;
    }
    if (indexBefore < columnBefore.tasks.length - 1) {
      nextIdBefore = columnBefore.tasks[indexBefore + 1].id;
    }
  } else {
    const [boardDoc, tasksDocsAfter, prevTaskRefBefore, taskDocBefore] = await Promise.all([
      infoType.statusAfter ? getBoardDoc(boardId) : Promise.resolve(null),
      infoType.prevIdAfter || infoType.nextIdAfter
        ? getColumnTaskDocs(boardId, columnIdAfter)
        : Promise.resolve(null),
      infoType.prevIdBefore ? getPrevTaskRef(boardId, taskId) : Promise.resolve(null),
      infoType.nextIdBefore ? getTaskDoc(boardId, taskId) : Promise.resolve(null),
    ]);

    if (boardDoc) {
      statusAfter = {
        id: columnIdAfter,
        name: (boardDoc.data() as BoardDocSchema).columns[columnIdAfter].name,
      };
    }

    if (tasksDocsAfter) {
      const tasksIdsAfter: UniqueId[] = [];
      tasksDocsAfter.forEach((doc) => {
        const { nextId } = doc.data() as TaskDocSchema;
        const index = Math.max(
          0,
          tasksIdsAfter.findIndex((id) => id === nextId)
        );
        tasksIdsAfter.splice(index, 0, doc.id);
      });
      if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < tasksIdsAfter.length) {
        prevIdAfter = tasksIdsAfter[indexAfter];
      }
      if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < tasksIdsAfter.length - 1) {
        nextIdAfter = tasksIdsAfter[indexAfter + 1];
      }
    }

    if (prevTaskRefBefore) {
      prevIdBefore = prevTaskRefBefore.id;
    }

    if (taskDocBefore) {
      nextIdBefore = (taskDocBefore.data() as TaskDocSchema).nextId;
    }
  }

  return {
    statusAfter: infoType.statusAfter ? statusAfter : undefined,
    prevIdAfter: infoType.prevIdAfter ? prevIdAfter : undefined,
    nextIdAfter: infoType.nextIdAfter ? nextIdAfter : undefined,
    prevIdBefore: infoType.prevIdBefore ? prevIdBefore : undefined,
    nextIdBefore: infoType.nextIdBefore ? nextIdBefore : undefined,
  };
}
