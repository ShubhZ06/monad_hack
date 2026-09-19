import { http, createConfig } from 'wagmi';
import { monadTestnet } from './config';
import { injected, mock } from 'wagmi/connectors';

export const config = createConfig({
  chains: [monadTestnet],
  connectors: [
    injected(),
    mock({
      accounts: [
        '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
      ],
    }),
  ],
  transports: {
    [monadTestnet.id]: http(),
  },
  ssr: true,
});


