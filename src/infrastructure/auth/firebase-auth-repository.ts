import {
  createUserWithEmailAndPassword,
  getAuth,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
  updateProfile,
} from 'firebase/auth';

import type { AuthRepository, AuthUser, LoginInfo, RegisterInfo } from 'core/ports';
import { firebaseApp } from 'infrastructure/config';

export class FirebaseAuthRepository implements AuthRepository {
  #auth = getAuth(firebaseApp);
  #authenticatedUser: AuthUser = null;
  #onAuthChangeCallback: (() => void) | undefined = undefined;

  constructor() {
    onAuthStateChanged(this.#auth, (user) => {
      this.#authenticatedUser = user
        ? {
            id: user.uid,
            username: user.displayName ?? 'Logged user',
            avatar_url: user.photoURL ?? undefined,
          }
        : null;
      if (this.#onAuthChangeCallback) {
        this.#onAuthChangeCallback();
      }
    });
  }

  async register(authInfo: RegisterInfo) {
    if (authInfo.method === 'email') {
      const userCredential = await createUserWithEmailAndPassword(
        this.#auth,
        authInfo.email,
        authInfo.password
      );
      await updateProfile(userCredential.user, { displayName: authInfo.username });
    }

    if (authInfo.method === 'google') {
      await this.login({ method: authInfo.method });
    }
  }

  async login(authInfo: LoginInfo) {
    if (authInfo.method === 'email') {
      await signInWithEmailAndPassword(this.#auth, authInfo.email, authInfo.password);
    }

    if (authInfo.method === 'google') {
      await signInWithRedirect(this.#auth, new GoogleAuthProvider());
      await getRedirectResult(this.#auth);
    }
  }

  async logout() {
    await signOut(this.#auth);
  }

  getUser() {
    return this.#authenticatedUser;
  }

  listenToAuthChange(callback: () => void) {
    this.#onAuthChangeCallback = callback;
    return () => {
      this.#onAuthChangeCallback = undefined;
    };
  }
}
