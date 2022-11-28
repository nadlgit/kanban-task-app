import { DocumentChange, Query, QueryDocumentSnapshot, SnapshotMetadata } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';
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
