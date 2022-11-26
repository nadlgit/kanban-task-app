import type { DocumentData, DocumentSnapshot, QuerySnapshot } from 'firebase/firestore';

import {
  getBoardDoc,
  getBoardTaskDocs,
  getColumnTaskDocs,
  getPrevTaskDocRef,
  getTaskDoc,
} from './firestore-helpers';
import type { BoardDocSchema, TaskDocSchema } from './firestore-helpers';
import type { BoardEntity, BoardList, TaskEntity, UniqueId } from 'core/entities';

export function convertToBoardList(boardDocs: QuerySnapshot<DocumentData>) {
  const boardList: BoardList = [];

  boardDocs.forEach((doc) => {
    const { name, nextId } = doc.data() as BoardDocSchema;
    const index = Math.max(
      0,
      boardList.findIndex(({ id }) => id === nextId)
    );
    boardList.splice(index, 0, { id: doc.id, name });
  });

  return boardList;
}

export function convertToBoard(
  boardInfo:
    | { board?: undefined; boardDoc: DocumentSnapshot<DocumentData> }
    | { board: BoardEntity; boardDoc?: undefined }
    | { board: BoardEntity; boardDoc: DocumentSnapshot<DocumentData> },
  tasksDocs?: QuerySnapshot<DocumentData>
) {
  const board: BoardEntity = boardInfo?.boardDoc
    ? {
        id: boardInfo.boardDoc.id,
        name: (boardInfo.boardDoc.data() as BoardDocSchema).name,
        columns: [],
      }
    : boardInfo.board;

  if (boardInfo?.boardDoc) {
    const { columns } = boardInfo.boardDoc.data() as BoardDocSchema;
    Object.entries(columns).forEach(([key, { name, nextId }]) => {
      const index = Math.max(
        0,
        board.columns.findIndex(({ id }) => id === nextId)
      );
      board.columns.splice(index, 0, { id: key, name, tasks: [] });
    });

    if (boardInfo?.board) {
      for (const elt of board.columns) {
        const oldElt = boardInfo.board.columns.find(({ id }) => id === elt.id);
        if (oldElt) {
          elt.tasks = oldElt.tasks;
        }
      }
    }
  }

  if (tasksDocs && !tasksDocs?.empty) {
    const tasks: Record<string, TaskEntity[]> = {};

    tasksDocs.forEach((doc) => {
      const {
        title,
        description,
        subtasks,
        status: { id: columnId },
        nextId,
      } = doc.data() as TaskDocSchema;
      if (!tasks[columnId]) tasks[columnId] = [];
      const index = Math.max(
        0,
        tasks[columnId].findIndex(({ id }) => id === nextId)
      );
      tasks[columnId].splice(index, 0, { id: doc.id, title, description, subtasks });
    });

    for (const elt of board.columns) {
      elt.tasks = tasks[elt.id] ?? [];
    }
  }

  return board;
}

export function getBoardInfo(
  infoType: Record<'prevIdAfter' | 'nextIdAfter' | 'prevIdBefore' | 'nextIdBefore', boolean>,
  context: {
    boardId: UniqueId;
    boardList: BoardList;
    indexAfter?: number;
  }
) {
  const { boardId, boardList, indexAfter } = context;

  let prevIdAfter: BoardDocSchema['nextId'] = null;
  let nextIdAfter: BoardDocSchema['nextId'] = null;
  let prevIdBefore: BoardDocSchema['nextId'] = null;
  let nextIdBefore: BoardDocSchema['nextId'] = null;
  if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < boardList.length) {
    prevIdAfter = boardList[indexAfter].id;
  }
  if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < boardList.length - 1) {
    nextIdAfter = boardList[indexAfter + 1].id;
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
  let prevIdAfter: TaskDocSchema['nextId'] = null;
  let nextIdAfter: TaskDocSchema['nextId'] = null;
  let prevIdBefore: TaskDocSchema['nextId'] = null;
  let nextIdBefore: TaskDocSchema['nextId'] = null;
  const columnBefore = board?.columns.find(({ id }) => id === columnIdBefore);
  const columnAfter =
    columnIdAfter === columnIdBefore
      ? columnBefore
      : board?.columns.find(({ id }) => id === columnIdAfter);
  if (board && board.id === boardId && columnBefore && columnAfter) {
    statusAfter = { id: columnAfter.id, name: columnAfter.name };
    if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < columnAfter.tasks.length) {
      prevIdAfter = columnAfter.tasks[indexAfter].id;
    }
    if (indexAfter !== undefined && indexAfter >= 0 && indexAfter < columnAfter.tasks.length - 1) {
      nextIdAfter = columnAfter.tasks[indexAfter + 1].id;
    }
    const indexBefore = columnBefore.tasks.findIndex(({ id }) => id === taskId);
    if (indexBefore > 0) {
      prevIdBefore = columnBefore.tasks[indexBefore - 1].id;
    }
    if (indexBefore < columnBefore.tasks.length - 1) {
      nextIdBefore = columnBefore.tasks[indexBefore + 1].id;
    }
  } else {
    const [boardDoc, tasksDocsAfter, prevtaskDocRefBefore, taskDocBefore] = await Promise.all([
      infoType.statusAfter ? getBoardDoc(boardId) : Promise.resolve(null),
      infoType.prevIdAfter || infoType.nextIdAfter
        ? getColumnTaskDocs(boardId, columnIdAfter)
        : Promise.resolve(null),
      infoType.prevIdBefore ? getPrevTaskDocRef(boardId, taskId) : Promise.resolve(null),
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

    if (prevtaskDocRefBefore) {
      prevIdBefore = prevtaskDocRefBefore.id;
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
