import type {
  CollectionReference,
  DocumentData,
  DocumentReference,
  Firestore,
} from 'firebase/firestore';

import { doNothing } from 'core/utils';

export class FirestoreRef implements DocumentReference<DocumentData> {
  readonly converter = null;
  readonly type = 'document';
  readonly firestore: Firestore = {} as typeof this.firestore;
  path = '';
  parent: CollectionReference<DocumentData> = {} as typeof this.parent;
  withConverter: () => DocumentReference<DocumentData> = doNothing as typeof this.withConverter;

  #id: string;

  constructor(ref: { id: string }) {
    const { id } = ref;
    this.#id = id;
  }

  get id() {
    return this.#id;
  }
}
