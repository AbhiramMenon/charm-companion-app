// Shared flag: prevents onAuthStateChange from auto-logging in during signup flow.
// Set to true before signUp(), back to false after signOut().
let _signupInProgress = false;

export function setSignupInProgress(v: boolean) {
  _signupInProgress = v;
}

export function isSignupInProgress() {
  return _signupInProgress;
}
