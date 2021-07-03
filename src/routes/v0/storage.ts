import path from 'path'
import Router, { Middleware } from '@koa/router'
import multer from '@koa/multer'
import { buildHandler } from '../factory'
import * as types from '../../types'

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
  .post('/upload', upload.single('entity'), buildHandler('todo', types.METHOD_NAMESPACE.STORAGE))

// export routers
const router = new Router()
  .post('/:store', storageRouter.routes() as Middleware<any, {}>)

export = router
