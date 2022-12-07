import type { Dependencies as OrigDependencies } from 'core/dependencies';

let Dependencies: typeof OrigDependencies;

beforeEach(() => {
  return import('./dependencies').then((module) => {
    Dependencies = module.Dependencies;
    jest.resetModules();
  });
});

const mockAppNotificationFactory = () => ({
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
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
  appNotification: ReturnType<typeof mockAppNotificationFactory>;
  authRepository: ReturnType<typeof mockAuthRepositoryFactory>;
  boardRepository: ReturnType<typeof mockBoardRepositoryFactory>;
  demoRepository: ReturnType<typeof mockBoardRepositoryFactory>;
};

const fakeDependencies: FakeDependenciesInit = {
  appNotification: mockAppNotificationFactory(),
  authRepository: mockAuthRepositoryFactory(),
  boardRepository: mockBoardRepositoryFactory(),
  demoRepository: mockBoardRepositoryFactory(),
};

const fakeDependenciesOtherAppNotif: FakeDependenciesInit = {
  ...fakeDependencies,
  appNotification: mockAppNotificationFactory(),
};

const fakeDependenciesOtherAuthRepo: FakeDependenciesInit = {
  ...fakeDependencies,
  authRepository: mockAuthRepositoryFactory(),
};

const fakeDependenciesOtherBoardRepo: FakeDependenciesInit = {
  ...fakeDependencies,
  boardRepository: mockBoardRepositoryFactory(),
};

const fakeDependenciesOtherDemoRepo: FakeDependenciesInit = {
  ...fakeDependencies,
  demoRepository: mockBoardRepositoryFactory(),
};

describe.each([
  {
    desc: 'getAppNotification()',
    testedFn: () => Dependencies.getAppNotification(),
    expectedField: 'appNotification',
    otherTestDependencies: fakeDependenciesOtherAppNotif,
  },
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

describe('demoRepository handling', () => {
  it('isDemo() should initially return false', () => {
    expect(Dependencies.isDemo()).toBeFalsy();
  });

  it('getBoardRepository() should throw when not initialized', () => {
    const testedFn = () => Dependencies.getBoardRepository();

    const testDependencies = { ...fakeDependencies };
    expect(testedFn).toThrow();

    Dependencies.init(testDependencies);

    expect(testedFn).not.toThrow();
  });

  it('getBoardRepository() should return value initialized by first call to init()', () => {
    const testedFn = () => Dependencies.getBoardRepository();
    const expectedField = 'demoRepository';
    const otherTestDependencies = fakeDependenciesOtherDemoRepo;
    Dependencies.setIsDemo(true);

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
