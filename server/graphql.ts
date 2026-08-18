import { buildSchema } from 'drizzle-graphql';
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
} from 'graphql';
import { createYoga } from 'graphql-yoga';

import { getDb } from '../src/db/client';
import { AGENT_SUPERADMIN } from '../src/lib/agent-superadmin';

const GRAPHQL_ENDPOINT = '/graphql';

type YogaInstance = ReturnType<typeof createYoga>;

let yogaReady: Promise<YogaInstance> | null = null;

/**
 * One-liner from drizzle-graphql:
 *   const { schema } = buildSchema(db)
 *
 * Full generated CRUD for every pgTable. Agents run as super_admin with
 * unrestricted autonomy — introspection, GraphiQL, and all mutations stay on.
 */
async function createGraphqlYoga(): Promise<YogaInstance> {
  const db = await getDb();
  const { schema, entities } = buildSchema(db);

  const queryConfig = schema.getQueryType()?.toConfig();
  const mutationType = schema.getMutationType();

  const AgentOperation = new GraphQLObjectType({
    name: 'AgentOperation',
    fields: {
      name: { type: new GraphQLNonNull(GraphQLString) },
      kind: { type: new GraphQLNonNull(GraphQLString) },
    },
  });

  const AgentIdentity = new GraphQLObjectType({
    name: 'AgentIdentity',
    fields: {
      id: { type: new GraphQLNonNull(GraphQLString) },
      email: { type: new GraphQLNonNull(GraphQLString) },
      role: { type: new GraphQLNonNull(GraphQLString) },
      autonomy: { type: new GraphQLNonNull(GraphQLString) },
      privileges: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(GraphQLString))),
      },
    },
  });

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...(queryConfig?.fields ?? {}),
      agentIdentity: {
        type: new GraphQLNonNull(AgentIdentity),
        description: 'This connection is super_admin with unrestricted CRUD autonomy.',
        resolve: () => AGENT_SUPERADMIN,
      },
      agentOperations: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgentOperation))),
        description:
          'Every generated CRUD field. Agents may call any of them with no further authorization.',
        resolve: () => [
          ...Object.keys(entities.queries).map((name) => ({ name, kind: 'query' })),
          ...Object.keys(entities.mutations).map((name) => ({ name, kind: 'mutation' })),
        ],
      },
    },
  });

  const enhanced = new GraphQLSchema({
    query: queryType,
    mutation: mutationType ?? undefined,
    types: [...Object.values(entities.types), ...Object.values(entities.inputs)],
  });

  return createYoga({
    schema: enhanced,
    graphqlEndpoint: GRAPHQL_ENDPOINT,
    graphiql: true,
    landingPage: false,
    maskedErrors: false,
    healthCheckEndpoint: '/graphql/health',
    cors: {
      origin: '*',
      credentials: false,
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['*'],
    },
    context: () => ({
      db,
      actor: AGENT_SUPERADMIN,
    }),
  });
}

export function getGraphqlYoga(): Promise<YogaInstance> {
  yogaReady ??= createGraphqlYoga().catch((err) => {
    yogaReady = null;
    throw err;
  });
  return yogaReady;
}

export function isGraphqlRequest(url: string): boolean {
  const path = url.split('?')[0] ?? '';
  return path === GRAPHQL_ENDPOINT || path.startsWith(`${GRAPHQL_ENDPOINT}/`);
}

export { GRAPHQL_ENDPOINT };
