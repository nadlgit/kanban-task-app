import { faker } from '@faker-js/faker';

import {
  addBoardListSubscriptionCallback,
  addBoardSubscriptionCallback,
  getBoardListSubscriptionValue,
  getBoardSubscriptionValue,
  initBoardListSubscription,
  initBoardSubscription,
  isBoardListSubscriptionInitialized,
  isBoardSubscriptionInitialized,
} from './data-subscription';
import {
  onBoardDocSnapshot,
  onBoardTaskDocsSnapshot,
  onUserBoardDocsSnapshot,
} from './firestore-helpers';
import type { FirestoreDoc, FirestoreDocs } from './firestore-helpers';
import { convertToBoard, convertToBoardList } from './helpers';
import { doNothing } from 'webui/shared';
import { BoardEntity } from 'core/entities';

jest.mock('./firestore-helpers');
jest.mock('./helpers');

const mockOnUserBoardDocsSnapshot = onUserBoardDocsSnapshot as jest.MockedFunction<
  typeof onUserBoardDocsSnapshot
>;
let mockOnUserBoardDocsSnapshotCallback: Record<
  Parameters<typeof onUserBoardDocsSnapshot>[0],
  Parameters<typeof onUserBoardDocsSnapshot>[1]
> = {};
mockOnUserBoardDocsSnapshot.mockImplementation((userId, callback) => {
  mockOnUserBoardDocsSnapshotCallback[userId] = callback;
  return doNothing;
});

const mockOnBoardDocSnapshot = onBoardDocSnapshot as jest.MockedFunction<typeof onBoardDocSnapshot>;
let mockOnBoardDocSnapshotCallback: Record<
  Parameters<typeof onBoardDocSnapshot>[0],
  Parameters<typeof onBoardDocSnapshot>[1]
> = {};
mockOnBoardDocSnapshot.mockImplementation((boardId, callback) => {
  mockOnBoardDocSnapshotCallback[boardId] = callback;
  return doNothing;
});

const mockOnBoardTaskDocsSnapshot = onBoardTaskDocsSnapshot as jest.MockedFunction<
  typeof onBoardTaskDocsSnapshot
>;
let mockOnBoardTaskDocsSnapshotCallback: Record<
  Parameters<typeof onBoardTaskDocsSnapshot>[0],
  Parameters<typeof onBoardTaskDocsSnapshot>[1]
> = {};
mockOnBoardTaskDocsSnapshot.mockImplementation((boardId, callback) => {
  mockOnBoardTaskDocsSnapshotCallback[boardId] = callback;
  return doNothing;
});

const mockConvertToBoardList = convertToBoardList as jest.MockedFunction<typeof convertToBoardList>;
const mockBoardDocs1 = {
  snapshot: {} as FirestoreDocs,
  boardList: [
    { id: faker.datatype.uuid(), name: faker.lorem.words() },
    { id: faker.datatype.uuid(), name: faker.lorem.words() },
    { id: faker.datatype.uuid(), name: faker.lorem.words() },
  ],
};
const mockBoardDocs2 = {
  snapshot: {} as FirestoreDocs,
  boardList: [{ id: faker.datatype.uuid(), name: faker.lorem.words() }],
};
mockConvertToBoardList.mockImplementation((boardDocs) => {
  if (boardDocs === mockBoardDocs1.snapshot) {
    return mockBoardDocs1.boardList;
  }
  if (boardDocs === mockBoardDocs2.snapshot) {
    return mockBoardDocs2.boardList;
  }
  return [];
});

const mockConvertToBoard = convertToBoard as jest.MockedFunction<typeof convertToBoard>;
const mockBoardAndTaskDocs1 = {
  boardDoc: {} as FirestoreDoc,
  tasksDocs: {} as FirestoreDocs,
  board: { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
};
const mockBoardAndTaskDocs2 = {
  boardDoc: {} as FirestoreDoc,
  tasksDocs: {} as FirestoreDocs,
  board: { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
};
const mockBoardAndTaskDocs3 = {
  boardDoc: {} as FirestoreDoc,
  tasksDocs: {} as FirestoreDocs,
  board: { id: faker.datatype.uuid(), name: faker.lorem.words(), columns: [] },
};
mockConvertToBoard.mockImplementation(({ boardDoc }, tasksDocs) => {
  if (
    boardDoc === mockBoardAndTaskDocs1.boardDoc &&
    tasksDocs === mockBoardAndTaskDocs1.tasksDocs
  ) {
    return mockBoardAndTaskDocs1.board;
  }
  if (
    boardDoc === mockBoardAndTaskDocs2.boardDoc &&
    tasksDocs === mockBoardAndTaskDocs2.tasksDocs
  ) {
    return mockBoardAndTaskDocs2.board;
  }
  if (
    boardDoc === mockBoardAndTaskDocs3.boardDoc &&
    tasksDocs === mockBoardAndTaskDocs3.tasksDocs
  ) {
    return mockBoardAndTaskDocs3.board;
  }
  return {} as BoardEntity;
});

const mockQuerySnapshot = {} as FirestoreDocs;
const mockDocumentSnapshot = {} as FirestoreDoc;

beforeEach(() => {
  jest.clearAllMocks();
  mockOnUserBoardDocsSnapshotCallback = {};
  mockOnBoardDocSnapshotCallback = {};
  mockOnBoardTaskDocsSnapshotCallback = {};
});

describe('BoardList subscription', () => {
  it('should handle initialized state', () => {
    const testUserId = faker.datatype.uuid();
    const testData = mockBoardDocs1;
    expect(testData.boardList).not.toEqual([]);

    expect(isBoardListSubscriptionInitialized(testUserId)).toBeFalsy();
    expect(getBoardListSubscriptionValue(testUserId)).toEqual([]);
    initBoardListSubscription(testUserId, testData.snapshot);
    expect(isBoardListSubscriptionInitialized(testUserId)).toBeTruthy();
    expect(getBoardListSubscriptionValue(testUserId)).toEqual(testData.boardList);
  });

  it('should handle multiple values', () => {
    const testUserId1 = faker.datatype.uuid();
    const testData1 = mockBoardDocs1;
    const testUserId2 = faker.datatype.uuid();
    const testData2 = mockBoardDocs2;

    initBoardListSubscription(testUserId1, testData1.snapshot);
    initBoardListSubscription(testUserId2, testData2.snapshot);
    expect(getBoardListSubscriptionValue(testUserId1)).toEqual(testData1.boardList);
    expect(getBoardListSubscriptionValue(testUserId2)).toEqual(testData2.boardList);
  });

  it('should handle callbacks', () => {
    const testUserId = faker.datatype.uuid();
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();

    const unsubcribe1 = addBoardListSubscriptionCallback(testUserId, testCallback1);
    const unsubcribe2 = addBoardListSubscriptionCallback(testUserId, testCallback2);
    mockOnUserBoardDocsSnapshotCallback[testUserId](mockQuerySnapshot);
    unsubcribe1();
    mockOnUserBoardDocsSnapshotCallback[testUserId](mockQuerySnapshot);
    unsubcribe2();
    mockOnUserBoardDocsSnapshotCallback[testUserId](mockQuerySnapshot);
    expect(testCallback1).toHaveBeenCalledTimes(1);
    expect(testCallback2).toHaveBeenCalledTimes(2);
  });
});

describe('Board subscription', () => {
  it('should handle initialized state', () => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testData = mockBoardAndTaskDocs1;
    expect(testData.board).not.toBeUndefined();

    expect(isBoardSubscriptionInitialized(testUserId, testBoardId)).toBeFalsy();
    expect(getBoardSubscriptionValue(testUserId, testBoardId)).toBeUndefined();
    initBoardSubscription(testUserId, testBoardId, testData.boardDoc, testData.tasksDocs);
    expect(isBoardSubscriptionInitialized(testUserId, testBoardId)).toBeTruthy();
    expect(getBoardSubscriptionValue(testUserId, testBoardId)).toEqual(testData.board);
  });

  it('should handle multiple values', () => {
    const testUserId1 = faker.datatype.uuid();
    const testBoardId1 = faker.datatype.uuid();
    const testData1 = mockBoardAndTaskDocs1;
    const testUserId2 = faker.datatype.uuid();
    const testBoardId2 = faker.datatype.uuid();
    const testData2 = mockBoardAndTaskDocs2;
    const testUserId3 = testUserId1;
    const testBoardId3 = faker.datatype.uuid();
    const testData3 = mockBoardAndTaskDocs3;

    initBoardSubscription(testUserId1, testBoardId1, testData1.boardDoc, testData1.tasksDocs);
    initBoardSubscription(testUserId2, testBoardId2, testData2.boardDoc, testData2.tasksDocs);
    initBoardSubscription(testUserId3, testBoardId3, testData3.boardDoc, testData3.tasksDocs);
    expect(getBoardSubscriptionValue(testUserId1, testBoardId1)).toEqual(testData1.board);
    expect(getBoardSubscriptionValue(testUserId2, testBoardId2)).toEqual(testData2.board);
    expect(getBoardSubscriptionValue(testUserId3, testBoardId3)).toEqual(testData3.board);
  });

  it('should handle callbacks', () => {
    const testUserId = faker.datatype.uuid();
    const testBoardId = faker.datatype.uuid();
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();

    const unsubcribe1 = addBoardSubscriptionCallback(testUserId, testBoardId, testCallback1);
    const unsubcribe2 = addBoardSubscriptionCallback(testUserId, testBoardId, testCallback2);
    mockOnBoardDocSnapshotCallback[testBoardId](mockDocumentSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoardId](mockQuerySnapshot);
    unsubcribe1();
    mockOnBoardDocSnapshotCallback[testBoardId](mockDocumentSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoardId](mockQuerySnapshot);
    unsubcribe2();
    mockOnBoardDocSnapshotCallback[testBoardId](mockDocumentSnapshot);
    mockOnBoardTaskDocsSnapshotCallback[testBoardId](mockQuerySnapshot);
    expect(testCallback1).toHaveBeenCalledTimes(2);
    expect(testCallback2).toHaveBeenCalledTimes(4);
  });
});
