import { faker } from '@faker-js/faker';
import { DocumentChange, Query, QueryDocumentSnapshot, SnapshotMetadata } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

import type { BoardEntity, BoardList, UniqueId } from 'core/entities';
import type { BoardDocSchema, TaskDocSchema } from './firestore-helpers';
import { doNothing } from 'webui/shared';

export class FirestoreDoc extends QueryDocumentSnapshot<DocumentData> {
  #id: string;
  #data: DocumentData;

  constructor(doc: { id: string; data: DocumentData }) {
    const { id, data } = doc;
    super();
    this.#id = id;
    this.#data = data;
  }

  get id() {
    return this.#id;
  }

  data() {
    return this.#data;
  }

  exists() {
    return Object.keys(this.#data ?? {}).length > 0;
  }
}

export class FirestoreDocs {
  metadata: SnapshotMetadata;
  query: Query<DocumentData>;
  docs: FirestoreDoc[];
  size: number;
  empty: boolean;
  forEach: (callback: (result: FirestoreDoc) => void, thisArg?: unknown) => void;
  docChanges: () => DocumentChange<DocumentData>[];

  constructor(docs: { id: string; data: DocumentData }[] = []) {
    this.metadata = {} as typeof this.metadata;
    this.query = {} as typeof this.query;
    this.docs = docs.map((doc) => new FirestoreDoc(doc));
    this.size = this.docs.length;
    this.empty = !(this.docs.length > 0);
    this.forEach = (callback) => this.docs.forEach(callback);
    this.docChanges = doNothing as typeof this.docChanges;
  }
}

export function testBoardDataFactory(
  board: BoardEntity,
  nextBoardId?: UniqueId,
  userId?: UniqueId
) {
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
}

export function testBoardListDataFactory(boardList: BoardList) {
  const boardDocs: { id: string; data: BoardDocSchema }[] = [];
  boardList.forEach(({ id, name }, idx) => {
    const nextId = idx < boardList.length - 1 ? boardList[idx + 1].id : undefined;
    const { boardDoc } = testBoardDataFactory({ id, name, columns: [] }, nextId);
    boardDocs.push(boardDoc);
  });
  return { boardList, boardDocs };
}
