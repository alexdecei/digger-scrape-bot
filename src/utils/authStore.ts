export type AuthUser = 'MANU' | 'YO' | null;

let currentUser: AuthUser = null;

export function setAuth(user: AuthUser) {
  currentUser = user;
}

export function getAuth(): AuthUser {
  return currentUser;
}