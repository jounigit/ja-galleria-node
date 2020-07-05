const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Category = require('../models/category')
const Album = require('../models/album')
const User = require('../models/user')

//********** constants *******************************/
const initialCategories = [
  {
    title: 'Category 1',
    content: 'HTML is easy',
  },
  {
    title: 'Category 2',
    content: 'Täällä tätä.',
  }
]

const initialAlbums = [
  {
    title: 'Album 1',
    content: 'Täällä 1',
  },
  {
    title: 'Album 2',
    content: 'Täällä 2.',
  },
  {
    title: 'Album 3',
    content: 'Täällä 3',
  },
]

//********** delete all records *******************************/
const clearAllTables = async () => {
  await Album.deleteMany({})
  await Category.deleteMany({})
  await User.deleteMany({})
}

const removeAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    await collection.deleteMany()
  }
}

const dropAllCollections = async () => {
  const collections = Object.keys(mongoose.connection.collections)
  for (const collectionName of collections) {
    const collection = mongoose.connection.collections[collectionName]
    try {
      await collection.drop()
    } catch (error) {
      // This error happens when you try to drop a collection that's already dropped. Happens infrequently.
      // Safe to ignore.
      if (error.message === 'ns not found') return

      // This error happens when you use it.todo.
      // Safe to ignore.
      if (error.message.includes('a background operation is currently running'))
        return

      console.log(error.message)
    }
  }
}

//********** user helpers *******************************/
const username = 'test'
const email = 'test@mail.com'
const password = 'testpassi'

const addTestUser = async () => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const testUser = {
    username,
    email,
    passwordHash
  }

  await User.create(testUser)
}

const getToken = async () => {
  const response = await api
    .post('/api/login')
    .send({
      username,
      password,
    })

  console.log('TOKEN: ', response.body.token)
  return response.body.token
}

//********** common helpers *******************************/
const allInCollection = async (collection) => {
  const documents = await collection.find({})
  return documents.map(document => document.toJSON())
}

const nonExistingId = async (collection) => {
  const document = new collection({ title: 'willremovethissoon' })
  await document.save()
  await document.remove()

  return document._id.toString()
}

module.exports = {
  initialCategories,
  initialAlbums,
  nonExistingId,
  addTestUser,
  getToken,
  removeAllCollections,
  clearAllTables,
  allInCollection,
  dropAllCollections
}