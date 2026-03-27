import { isAuthenticated } from '@/modules/auth/session';

export async function SignedIn({ children }: { children: React.ReactNode }) {
  const authenticated = await isAuthenticated();

  if (!authenticated) {
    return null;
  }

  return <>{children}</>;
}
