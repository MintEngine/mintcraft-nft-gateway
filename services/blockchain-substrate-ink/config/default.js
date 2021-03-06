// const fs = require('fs')
// const path = require('path')

module.exports = {
  logLevel: 'INFO',
  endpoints: {
    canvas: [
      {
        name: 'local',
        url: 'ws://127.0.0.1:9944'
      },
      {
        name: 'parity',
        url: 'wss://canvas-rpc.parity.io'
      }
    ]
  },
  contracts: [
    // {
    //   name: '<name>',
    //   category: 'nft|token'
    //   symbol?: '<token symbol>',
    //   address: '<address>',
    //   abi: JSON.parse(fs.readFileSync(path.resolve(__dirname, './abis/metadata.json')))
    // }
  ]
}
