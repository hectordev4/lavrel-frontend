import { TestBed } from '@angular/core/testing';
import { AuthGateway } from '../app/core/auth/auth-gateway';
import { AuthStore } from '../app/core/auth/auth.store';
import { AuthUser } from '../app/core/auth/models/auth-user.model';
import { FakeAuthGateway } from './fake-auth-gateway';

/** Provider replacing Firebase with the fake gateway. */
export const fakeAuthProvider = { provide: AuthGateway, useClass: FakeAuthGateway };

/** Sets who is signed in for the current TestBed (null: signed out). */
export function signInAs(user: AuthUser | null): AuthStore {
  const store = TestBed.inject(AuthStore);
  store.set(user);
  TestBed.tick();
  return store;
}

export function fakeGateway(): FakeAuthGateway {
  return TestBed.inject(AuthGateway) as FakeAuthGateway;
}
