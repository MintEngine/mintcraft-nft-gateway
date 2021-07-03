import path from 'path'
import Router, { Middleware } from '@koa/router'
import multer from '@koa/multer'
import { METHOD_NAMESPACE } from '@mintcraft/types'
import { buildHandler } from '../factory'

const fileStorage = multer.diskStorage({
  destination: path.resolve(process.cwd(), '/uploads'),
  filename: (req, file, callback) => {
    const extname = path.extname(file.originalname)
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    callback(null, `${file.fieldname}-${uniqueSuffix}${extname}`)
  }
})
const upload = multer({ storage: fileStorage })

const storageRouter = new Router()
// upload entity to storage
  .post('/entity', upload.single('entity'), buildHandler('entity-single-file-upload', METHOD_NAMESPACE.STORAGE))
// get entity metadata
  .get('/entity/:reference', buildHandler('entity-fetch-metadata', METHOD_NAMESPACE.STORAGE))
// get entity as json data directly
  .get('/entity/:reference/json', buildHandler('entity-fetch-data', METHOD_NAMESPACE.STORAGE))

// export routers
const router = new Router()
  .post('/:store', storageRouter.routes() as Middleware<any, {}>)

export = router
