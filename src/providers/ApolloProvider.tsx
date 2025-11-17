"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";

function makeClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
  })
  return new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
  });
}

export default function ApolloProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = makeClient();

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}