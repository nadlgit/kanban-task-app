// import { FakeAuthRepository } from './fake-auth-repository';

// export const authRepository = new FakeAuthRepository();

import { FirebaseAuthRepository } from './firebase-auth-repository';

export const authRepository = new FirebaseAuthRepository();
