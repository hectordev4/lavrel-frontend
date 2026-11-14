import { AuthProvider } from './auth-provider.model';

/** The signed-in person as the frontend sees them. Firebase types never leave the gateway. */
export interface AuthUser {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  provider: AuthProvider;
  /** When the Firebase account was created (ISO), if known: tells a brand-new account from an older one. */
  createdAt?: string | null;
}
