"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// ✅ FIX 1: Import ONLY the TYPE information for Ably.
// The `import type` statement is crucial. It gives TypeScript the type definitions
// but is completely erased during the build, so it doesn't pull in any server-side code.
import type Ably from 'ably';

// Create a context for the Ably client
const AblyContext = createContext<Ably.Realtime | null>(null);

// Custom hook to access the Ably client
export const useAbly = () => {
  return useContext(AblyContext);
};

// Provider component to initialize and provide the Ably client
export const AblyProvider = ({ children }: { children: ReactNode }) => {
  // The state holds the client instance once it's created.
  const [client, setClient] = useState<Ably.Realtime | null>(null);

  useEffect(() => {
    // This effect runs ONLY on the client-side after the component has mounted.

    // ✅ FIX 2: Use a dynamic import() inside an async function.
    // This tells the bundler to treat 'ably' as a dynamically loaded module,
    // preventing it from being included in the initial server-side bundle.
    const initializeAbly = async () => {
      // Dynamically import the Ably library.
      const AblyClient = await import('ably');

      // Now that the library is loaded, create the client instance.
      const ablyClient = new AblyClient.Realtime({
        authUrl: '/api/ably/token',
        authMethod: 'GET',
      });

      ablyClient.connection.on('connected', () => {
        console.log('Ably connected!');
        setClient(ablyClient);
      });

      ablyClient.connection.on('closed', () => {
        console.log('Ably connection closed.');
      });

      // We need to return the client instance so we can close it in the cleanup function.
      return ablyClient;
    };

    const ablyPromise = initializeAbly();

    // The cleanup function ensures we close the Ably connection when the component unmounts.
    return () => {
      ablyPromise.then(clientInstance => clientInstance.close());
      setClient(null);
    };
  }, []); // The empty dependency array ensures this effect runs only once.

  return (
    <AblyContext.Provider value={client}>
      {children}
    </AblyContext.Provider>
  );
};
