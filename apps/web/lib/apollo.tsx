'use client';

import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, split, HttpLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

function createApolloClient() {
  const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_GRAPHQL_HTTP_URL || 'http://localhost:8080/graphql',
  });

  const wsLink =
    typeof window !== 'undefined'
      ? new GraphQLWsLink(
          createClient({
            url: process.env.NEXT_PUBLIC_GRAPHQL_WS_URL || 'ws://localhost:8080/graphql/ws',
          })
        )
      : null;

  const splitLink =
    typeof window !== 'undefined' && wsLink != null
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === 'OperationDefinition' &&
              definition.operation === 'subscription'
            );
          },
          wsLink,
          httpLink
        )
      : httpLink;

  return new ApolloClient({
    link: splitLink,
    cache: new InMemoryCache(),
  });
}

export function StudioApolloProvider({ children }: { children: React.ReactNode }) {
  const [client] = React.useState(() => createApolloClient());
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
