/* eslint-disable no-undef */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

let PORT = process.env.PORT
let MONGODB_URI = process.env.MONGODB_URI
let MONGODB_TEST = process.env.TEST_DB
let AUTH_SECRET = process.env.SECRET

if (process.env.NODE_ENV === 'test') {
  MONGODB_URI = process.env.TEST_MONGODB_URI
}

module.exports = {
  AUTH_SECRET,
  MONGODB_URI,
  MONGODB_TEST,
  PORT
}