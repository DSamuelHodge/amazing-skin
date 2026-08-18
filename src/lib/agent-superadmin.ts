/** GraphQL and seed share this identity. Callers at /graphql are this actor. */
export const AGENT_SUPERADMIN = {
  id: '00000000-0000-4000-8000-000000000001',
  email: 'agent@lumina.local',
  role: 'super_admin',
  autonomy: 'unrestricted',
  privileges: ['introspect', 'query', 'insert', 'update', 'delete'] as const,
} as const;
