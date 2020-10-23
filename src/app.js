const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const app = express()
const fileupload = require('express-fileupload')
app.use(fileupload({
  useTempFiles: true
}))
const cors = require('cors')
const categoriesRouter = require('./controllers/categories')
const albumsRouter = require('./controllers/albums')
const picturesRouter = require('./controllers/pictures')
const usersRouter = require('./controllers/users')
const middleware = require('./utils/middleware')
const loginRouter = require('./controllers/login')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const loggedinRouter = require('./controllers/loggedin')
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: false
})
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/loggedin', loggedinRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/albums', albumsRouter)
app.use('/api/pictures', picturesRouter)

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app