import fs from 'fs'
import { URL } from 'url'
import config from 'config'
import { NFTStorage, File } from 'nft.storage'
import { ArgsEntityUpload, ResultEntityUploaded } from '@mintcraft/types'

/**
 * method implement
 * @param namespace
 * @param args
 */
export = async (namespace: string, args: ArgsEntityUpload): Promise<ResultEntityUploaded> => {
  const endpoint: string = config.get('nftStorage.endpoint')
  const token: string = config.get('nftStorage.accessToken')
  // storage instance
  const storage = new NFTStorage({ token, endpoint })
  // store metadata
  const metadata = await storage.store({
    // TODO implement ERC1155 metadata
    name: 'nft.storage store test',
    description:
      'Using the nft.storage metadata API to create ERC-1155 compatible metadata.',
    image: new File([await fs.promises.readFile('pinpie.jpg')], 'pinpie.jpg', {
      type: 'image/jpg'
    })
    // properties: {
    //   custom:
    //     'Any custom data can appear in properties, files are automatically uploaded.',
    //   file: new File([await fs.promises.readFile('README.md')], 'README.md', {
    //     type: 'text/plain'
    //   })
    // }
  })

  return {
    hashId: metadata.ipnft,
    url: new URL(metadata.url),
    metadata: metadata.data,
    embed: metadata.embed()
  }
}
