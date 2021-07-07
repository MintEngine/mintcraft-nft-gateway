
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
  EVM: [
    'mainnet',
    'ropsten',
    'rinkeby',
    'goerli'
  ],
  SUBSTRATE_INK: [
    'canvas'
  ],
  FLOW: [
    'mainnet'
  ]
}

export const STORAGES = {
  IPFS: 'ipfs',
  ARWEAVE: 'ar',
  SWARM: 'swarm'
}
