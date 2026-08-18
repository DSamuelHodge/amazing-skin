import { createAuthClient } from 'better-auth/react';
import { dashClient, sentinelClient } from '@better-auth/infra/client';

export const authClient = createAuthClient({
  basePath: '/api/auth',
  plugins: [
    dashClient(),
    sentinelClient({
      autoSolveChallenge: true,
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
