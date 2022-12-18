import type {
  DocumentChange,
  DocumentData,
  Query,
  QuerySnapshot,
  SnapshotMetadata,
} from 'firebase/firestore';

import { FirestoreDoc } from './firestore-doc';
import { doNothing } from 'core/utils';

export function emptyFirestoreDocs() {
  return new FirestoreDocs();
}

export class FirestoreDocs implements QuerySnapshot<DocumentData> {
  metadata: SnapshotMetadata = {} as typeof this.metadata;
  query: Query<DocumentData> = {} as typeof this.query;
  docs: FirestoreDoc[];
  size: number;
  empty: boolean;
  forEach: (callback: (result: FirestoreDoc) => void, thisArg?: unknown) => void;
  docChanges: () => DocumentChange<DocumentData>[] = doNothing as typeof this.docChanges;

  constructor(docs: { id: string; data: DocumentData }[] = []) {
    this.docs = docs.map((doc) => new FirestoreDoc(doc));
    this.size = this.docs.length;
    this.empty = !(this.docs.length > 0);
    this.forEach = (callback) => this.docs.forEach(callback);
  }
}
