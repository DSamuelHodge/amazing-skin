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

const GRAPHQL_ENDPOINT = '/graphql';

type YogaInstance = ReturnType<typeof createYoga>;

let yogaReady: Promise<YogaInstance> | null = null;

/**
 * One-liner from drizzle-graphql:
 *   const { schema } = buildSchema(db)
 *
 * That GraphQLSchema already has list/single queries plus insert/update/delete
 * mutations for every pgTable. We only wrap Query to add `agentOperations`,
 * so agents can introspect CRUD names without walking __schema.
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

  const queryType = new GraphQLObjectType({
    name: 'Query',
    fields: {
      ...(queryConfig?.fields ?? {}),
      agentOperations: {
        type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(AgentOperation))),
        description:
          'Generated CRUD field names from the Drizzle schema. Use GraphiQL or standard GraphQL introspection for args and types.',
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
    cors: false,
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
