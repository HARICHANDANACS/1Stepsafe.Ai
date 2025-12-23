'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  // Assume getAuth and app are initialized elsewhere
} from 'firebase/auth';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  // CRITICAL: Call signInAnonymously directly. Do NOT use 'await signInAnonymously(...)'.
  signInAnonymously(authInstance).catch((err) => {
    console.error("Anonymous sign-in error", err);
    // Optionally emit a global error
  });
  // Code continues immediately. Auth state change is handled by onAuthStateChanged listener.
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): Promise<void> {
  // CRITICAL: Call createUserWithEmailAndPassword directly.
  // We return the promise to allow the UI to handle navigation/errors upon completion.
  return createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      // Sign up successful, handled by auth state listener.
      // You could add post-signup logic here if needed.
    })
    .catch(error => {
      console.error("Email sign-up error", error);
      // Re-throw the error so the calling component can handle it (e.g., show a message).
      throw error;
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): Promise<void> {
  // CRITICAL: Call signInWithEmailAndPassword directly.
  // We return the promise to allow the UI to handle navigation/errors upon completion.
  return signInWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
      // Sign in successful, handled by auth state listener.
    })
    .catch(error => {
      console.error("Email sign-in error", error);
      // Re-throw the error so the calling component can handle it.
      throw error;
    });
}
