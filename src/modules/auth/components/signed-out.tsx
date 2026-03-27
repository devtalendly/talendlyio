import { isAuthenticated } from '@/modules/auth/session';

export async function SignedOut({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();

  if (authenticated) {
    return null;
  }

  return <>{children}</>;
}
