import type { AuthProvider, AuthUser, LoginInfo, RegisterInfo } from 'core/ports';

export class FakeAuthRepository implements AuthProvider {
  private authenticatedUser: AuthUser = null;
  private onAuthChangeCallback: () => void = () => {
    console.log('onAuthChangeCallback', this.authenticatedUser);
  };

  async register(authInfo: RegisterInfo) {
    this.onAuthChangeCallback();
    console.log('register', this.authenticatedUser, authInfo);
  }

  async login(authInfo: LoginInfo) {
    this.authenticatedUser = {
      id: '1234',
      username: 'John Doe',
    };
    this.onAuthChangeCallback();
    console.log('login', this.authenticatedUser, authInfo);
  }

  async logout() {
    this.authenticatedUser = null;
    this.onAuthChangeCallback();
    console.log('logout', this.authenticatedUser);
  }

  getUser() {
    console.log('getUser', this.authenticatedUser);
    return this.authenticatedUser;
  }

  listenToAuthChange(callback: () => void) {
    this.onAuthChangeCallback = () => {
      console.log('onAuthChangeCallback+cb', this.authenticatedUser);
      callback();
    };
    const POLL_FREQUENCY_MILLISECONDS = 60 * 1000;
    const intervalId = setInterval(() => this.onAuthChangeCallback(), POLL_FREQUENCY_MILLISECONDS);
    return () => clearTimeout(intervalId);
  }
}
