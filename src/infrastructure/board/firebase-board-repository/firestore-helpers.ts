import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import type {
  DocumentData,
  DocumentSnapshot,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

import type { UniqueId } from 'core/entities';
import { firebaseApp } from 'infrastructure/config';

export type FirestoreDocs = QuerySnapshot<DocumentData>;
export type FirestoreDoc = DocumentSnapshot<DocumentData>;

export type NextId = string | null;

export type BoardDocSchema = {
  owner: string;
  name: string;
  columns: Record<string, { name: string; nextId: NextId }>;
  nextId: NextId;
};

export type TaskDocSchema = {
  title: string;
  description: string;
  subtasks: {
    title: string;
    isCompleted: boolean;
  }[];
  status: { id: string; name: string };
  nextId: NextId;
};

const db = getFirestore(firebaseApp);

const boardCollection = collection(db, 'boards');
const userBoardCollectionQuery = (userId: UniqueId) =>
  query(boardCollection, where('owner', '==', userId));

const taskCollection = (boardId: UniqueId) => collection(doc(boardCollection, boardId), 'tasks');

export function newBoardRef() {
  return doc(boardCollection);
}

export function getBoardRef(boardId: UniqueId) {
  return doc(boardCollection, boardId);
}

export function newColumnId(boardId: UniqueId) {
  // NB: Shortcut to generate an ID even though there is no subcollection
  return doc(collection(doc(boardCollection, boardId), 'columns')).id;
}

export function newTaskRef(boardId: UniqueId) {
  return doc(taskCollection(boardId));
}

export function getTaskRef(boardId: UniqueId, taskId: UniqueId) {
  return doc(taskCollection(boardId), taskId);
}

export function startBatch() {
  return writeBatch(db);
}

export function getUserBoardDocs(userId: UniqueId) {
  return getDocs(userBoardCollectionQuery(userId));
}

export function onUserBoardDocsSnapshot(
  userId: UniqueId,
  callback: (snapshot: FirestoreDocs) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(userBoardCollectionQuery(userId), callback, onError);
}

export function getBoardDoc(boardId: UniqueId) {
  return getDoc(getBoardRef(boardId));
}

export function onBoardDocSnapshot(
  boardId: UniqueId,
  callback: (snapshot: FirestoreDoc) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(getBoardRef(boardId), callback, onError);
}

export function getBoardTaskDocs(boardId: UniqueId) {
  return getDocs(taskCollection(boardId));
}

export function onBoardTaskDocsSnapshot(
  boardId: UniqueId,
  callback: (snapshot: FirestoreDocs) => void,
  onError?: (error: FirestoreError) => void
) {
  return onSnapshot(taskCollection(boardId), callback, onError);
}
