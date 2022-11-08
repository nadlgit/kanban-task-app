import { faker } from '@faker-js/faker';

import { resetActiveBoardId } from './reset-active-board-id';
import type { BoardList } from 'core/entities';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('resetActiveBoardId()', () => {
  it('should keep activeId when it exists', () => {
    const testList = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
    const testActiveId = testList[testList.length - 1].id;

    const result = resetActiveBoardId(testList, testActiveId);

    expect(result).toEqual(testActiveId);
  });

  it("should return first item ID when activeId doesn't exist and list is not empty", () => {
    const testList = [
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
      { id: faker.datatype.uuid(), name: faker.lorem.words() },
    ];
    const testActiveId = faker.datatype.uuid();

    const result = resetActiveBoardId(testList, testActiveId);

    expect(result).toEqual(testList[0].id);
  });

  it("should return null when activeId doesn't exist and list is empty", () => {
    const testList = [] as BoardList;
    const testActiveId = faker.datatype.uuid();

    const result = resetActiveBoardId(testList, testActiveId);

    expect(result).toBeNull();
  });
});
