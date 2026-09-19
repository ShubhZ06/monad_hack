import { http, createConfig } from 'wagmi';
import { monadTestnet } from './config';
import { injected } from 'wagmi/connectors';

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected({ shimDisconnect: true }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: true,
});
