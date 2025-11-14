"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import type Ably from 'ably';

const AblyContext = createContext<Ably.Realtime | null>(null);

export const useAbly = () => {
  return useContext(AblyContext);
};

export const AblyProvider = ({ children }: { children: ReactNode }) => {
  const [client, setClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    const initializeAbly = async () => {
      const AblyClient = await import('ably');

      // The authUrl points to our secure token endpoint.
      // Ably's client will automatically handle authentication.
      const ablyClient = new AblyClient.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
      });

      ablyClient.connection.on('connected', () => {
        console.log('Ably connected for user!');
        setClient(ablyClient);
      });

      return ablyClient;
    };

    const ablyPromise = initializeAbly();

    return () => {
      ablyPromise.then(clientInstance => clientInstance.close());
      setClient(null);
    };
  }, []);

  return (
    <AblyContext.Provider value={client}>
      {children}
    </AblyContext.Provider>
  );
};
