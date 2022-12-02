const appNotification = {
  info: jest.fn(),
  success: jest.fn(),
  warning: jest.fn(),
  error: jest.fn(),
};

const authRepository = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  getUser: jest.fn(),
  listenToAuthChange: jest.fn(),
};

const boardRepository = {
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
};

let isDemo = false;

export const Dependencies = {
  init: jest.fn,

  setIsDemo: (value: boolean) => {
    isDemo = value;
  },

  isDemo: () => isDemo,

  getAppNotification: () => appNotification,

  getAuthRepository: () => authRepository,

  getBoardRepository: () => boardRepository,
};
