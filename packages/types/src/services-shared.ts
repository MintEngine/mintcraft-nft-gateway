
export const METHOD_NAMESPACE = {
  NULL: 'null',
  BLOCKCHAIN: 'blockchain',
  STORAGE: 'storage'
}

export const RESPONSE_MODES = {
  JSON: 'json',
  DOWNLOAD: 'download'
}

export const PLATFORMS = {
  EVM: 'ethereum',
  SUBSTRATE_INK: 'substrate-ink',
  FLOW: 'flow'
}

export const PLATFORM_CHAINIDS = {
  [PLATFORMS.EVM]: [
    'mainnet',
    'ropsten',
    'rinkeby',
    'goerli'
  ],
  [PLATFORMS.SUBSTRATE_INK]: [
    'canvas'
  ],
  [PLATFORMS.FLOW]: [
    'mainnet'
  ]
}

export const STORAGES = {
  IPFS: 'ipfs',
  ARWEAVE: 'ar',
  SWARM: 'swarm'
}
