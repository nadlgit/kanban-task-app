import { faker } from '@faker-js/faker';

import { BoardSubscription } from './board-subscription';
import {
  getBoardDoc,
  getBoardTaskDocs,
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
} from './firestore-helpers';
import { emptyFirestoreDocs, FirestoreDoc } from './test-utils';

jest.mock('./firestore-helpers');

const mockBoardDoc = new FirestoreDoc({
  id: faker.datatype.uuid(),
  data: {
    owner: faker.datatype.uuid(),
    name: faker.lorem.words(),
    columns: [],
    nextId: null,
  },
});

const mockGetBoardDoc = getBoardDoc as jest.MockedFunction<typeof getBoardDoc>;
mockGetBoardDoc.mockImplementation(() => {
  return Promise.resolve(mockBoardDoc);
});

const mockOnBoardDocSnapshot = onBoardDocSnapshot as jest.MockedFunction<typeof onBoardDocSnapshot>;
mockOnBoardDocSnapshot.mockImplementation(() => {
  return jest.fn();
});

const mockGetBoardTaskDocs = getBoardTaskDocs as jest.MockedFunction<typeof getBoardTaskDocs>;
mockGetBoardTaskDocs.mockImplementation(() => {
  return Promise.resolve(emptyFirestoreDocs());
});

const mockOnBoardTaskDocsSnapshot = onBoardTaskDocsSnapshot as jest.MockedFunction<
  typeof onBoardTaskDocsSnapshot
>;
mockOnBoardTaskDocsSnapshot.mockImplementation(() => {
  return jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BoardSubscription', () => {
  it('should handle initialization', async () => {
    const testBoardId = faker.datatype.uuid();

    const tested = new BoardSubscription(testBoardId);
    for (let i = 0; i < 3; i++) {
      await tested.getValue();
    }

    expect(getBoardDoc).toHaveBeenCalledTimes(1);
    expect(getBoardDoc).toHaveBeenCalledWith(testBoardId);
    expect(onBoardDocSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnBoardDocSnapshot.mock.calls[0][0]).toEqual(testBoardId);

    expect(getBoardTaskDocs).toHaveBeenCalledTimes(1);
    expect(getBoardTaskDocs).toHaveBeenCalledWith(testBoardId);
    expect(onBoardTaskDocsSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnBoardTaskDocsSnapshot.mock.calls[0][0]).toEqual(testBoardId);
  });

  it('should handle callbacks', () => {
    const testBoardId = faker.datatype.uuid();
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();

    const tested = new BoardSubscription(testBoardId);
    const unsubcribe1 = tested.addCallBack(testCallback1);
    const unsubcribe2 = tested.addCallBack(testCallback2);
    const baseSnapshotCallback = mockOnBoardDocSnapshot.mock.calls[0][1];
    const tasksSnapshotCallback = mockOnBoardTaskDocsSnapshot.mock.calls[0][1];

    baseSnapshotCallback(mockBoardDoc);
    tasksSnapshotCallback(emptyFirestoreDocs());
    unsubcribe1();
    baseSnapshotCallback(mockBoardDoc);
    tasksSnapshotCallback(emptyFirestoreDocs());
    unsubcribe2();
    baseSnapshotCallback(mockBoardDoc);
    tasksSnapshotCallback(emptyFirestoreDocs());
    expect(testCallback1).toHaveBeenCalledTimes(2);
    expect(testCallback2).toHaveBeenCalledTimes(4);
  });
});
