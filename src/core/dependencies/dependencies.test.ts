import type { Dependencies as OrigDependencies } from 'core/dependencies';

let Dependencies: typeof OrigDependencies;

beforeEach(() => {
  return import('./dependencies').then((module) => {
    Dependencies = module.Dependencies;
    jest.resetModules();
  });
});

const mockAuthRepositoryFactory = () => ({
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn(),
  listenToAuthChange: jest.fn(),
});

const mockBoardRepositoryFactory = () => ({
  getBoardList: jest.fn(),
  getBoard: jest.fn(),

  listenToBoardListChange: jest.fn(),
  listenToBoardChange: jest.fn(),

  addBoard: jest.fn(),
  addColumn: jest.fn(),
  addTask: jest.fn(),

  updateBoard: jest.fn(),
  updateColumn: jest.fn(),
  updateTask: jest.fn(),

  deleteBoard: jest.fn(),
  deleteColumn: jest.fn(),
  deleteTask: jest.fn(),
});

type FakeDependenciesInit = {
  authRepository: ReturnType<typeof mockAuthRepositoryFactory>;
  boardRepository: ReturnType<typeof mockBoardRepositoryFactory>;
};

const fakeDependencies: FakeDependenciesInit = {
  authRepository: mockAuthRepositoryFactory(),
  boardRepository: mockBoardRepositoryFactory(),
};

const fakeDependenciesOtherAuthRepo: FakeDependenciesInit = {
  ...fakeDependencies,
  authRepository: mockAuthRepositoryFactory(),
};

const fakeDependenciesOtherBoardRepo: FakeDependenciesInit = {
  ...fakeDependencies,
  boardRepository: mockBoardRepositoryFactory(),
};

describe.each([
  {
    desc: 'getAuthRepository()',
    testedFn: () => Dependencies.getAuthRepository(),
    expectedField: 'authRepository',
    otherTestDependencies: fakeDependenciesOtherAuthRepo,
  },
  {
    desc: 'getBoardRepository()',
    testedFn: () => Dependencies.getBoardRepository(),
    expectedField: 'boardRepository',
    otherTestDependencies: fakeDependenciesOtherBoardRepo,
  },
])('$desc', ({ testedFn, expectedField, otherTestDependencies }) => {
  it('should throw when not initialized', () => {
    const testDependencies = { ...fakeDependencies };
    expect(testedFn).toThrow();

    Dependencies.init(testDependencies);

    expect(testedFn).not.toThrow();
  });

  it('should return value initialized by first call to init()', () => {
    const testDependenciesFirst = { ...fakeDependencies };
    const testDependenciesSecond = { ...otherTestDependencies };
    const expected = testDependenciesFirst[expectedField as keyof FakeDependenciesInit];
    const notExpected = testDependenciesSecond[expectedField as keyof FakeDependenciesInit];

    expect(testedFn).toThrow();

    Dependencies.init(testDependenciesFirst);

    expect(testedFn).not.toThrow();
    expect(testedFn()).toEqual(expected);
    expect(testedFn()).not.toEqual(notExpected);

    Dependencies.init(testDependenciesSecond);

    expect(testedFn).not.toThrow();
    expect(testedFn()).toEqual(expected);
    expect(testedFn()).not.toEqual(notExpected);
  });
});
