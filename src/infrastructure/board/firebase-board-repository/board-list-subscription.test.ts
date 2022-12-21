import { faker } from '@faker-js/faker';

import { BoardListSubscription } from './board-list-subscription';
import { getUserBoardDocs, onUserBoardDocsSnapshot } from './firestore-helpers';
import { emptyFirestoreDocs } from './test-utils';

jest.mock('./firestore-helpers');

const mockGetUserBoardDocs = getUserBoardDocs as jest.MockedFunction<typeof getUserBoardDocs>;
mockGetUserBoardDocs.mockImplementation(() => {
  return Promise.resolve(emptyFirestoreDocs());
});

const mockOnUserBoardDocsSnapshot = onUserBoardDocsSnapshot as jest.MockedFunction<
  typeof onUserBoardDocsSnapshot
>;
mockOnUserBoardDocsSnapshot.mockImplementation(() => {
  return jest.fn();
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('BoardListSubscription', () => {
  it('should handle initialization', async () => {
    const testUserId = faker.datatype.uuid();

    const tested = new BoardListSubscription(testUserId);
    for (let i = 0; i < 3; i++) {
      await tested.getValue();
    }

    expect(getUserBoardDocs).toHaveBeenCalledTimes(1);
    expect(getUserBoardDocs).toHaveBeenCalledWith(testUserId);
    expect(onUserBoardDocsSnapshot).toHaveBeenCalledTimes(1);
    expect(mockOnUserBoardDocsSnapshot.mock.calls[0][0]).toEqual(testUserId);
  });

  it('should handle callbacks', () => {
    const testUserId = faker.datatype.uuid();
    const testCallback1 = jest.fn();
    const testCallback2 = jest.fn();

    const tested = new BoardListSubscription(testUserId);
    const unsubcribe1 = tested.addCallBack(testCallback1);
    const unsubcribe2 = tested.addCallBack(testCallback2);
    const snapshotCallback = mockOnUserBoardDocsSnapshot.mock.calls[0][1];

    snapshotCallback(emptyFirestoreDocs());
    unsubcribe1();
    snapshotCallback(emptyFirestoreDocs());
    unsubcribe2();
    snapshotCallback(emptyFirestoreDocs());
    expect(testCallback1).toHaveBeenCalledTimes(1);
    expect(testCallback2).toHaveBeenCalledTimes(2);
  });
});
