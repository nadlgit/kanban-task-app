import { QueryDocumentSnapshot } from 'firebase/firestore';
import type { DocumentData } from 'firebase/firestore';

export function emptyFirestoreDoc() {
  return new FirestoreDoc({} as FirestoreDoc);
}

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
