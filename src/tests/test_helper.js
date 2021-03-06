const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const Category = require('../models/category')
const Album = require('../models/album')
const User = require('../models/user')
const Picture = require('../models/picture')

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

const initialPictures = [
  {
    title: 'Picture 1',
    image: 'image.jpg'
  },
  {
    title: 'Picture 2',
    image: 'image.jpg'
  },
  {
    title: 'Picture 3',
    image: 'image.jpg'
  },
]

//********** delete all records *******************************/
const clearAllTables = async () => {
  await Album.deleteMany({})
  await Category.deleteMany({})
  await User.deleteMany({})
  await Picture.deleteMany({})
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
const role = 'editor'

const addTestUser = async (user=username, mail=email, pass=password, r=role) => {
  const saltRounds = 10
  const passwordHash = await bcrypt.hash(pass, saltRounds)

  const testUser = {
    username: user,
    email: mail,
    passwordHash,
    role: r
  }

  const newUser = await User.create(testUser)
  console.log('Testhelper New user: ', newUser)
  return newUser
}

const getToken = async (user=username, pass=password) => {
  const response = await api
    .post('/api/login')
    .send({
      username:user,
      password:pass,
    })

  console.log('GET VALID TOKEN: ', response.body.token)
  return response.body.token
}

//********** common helpers *******************************/
const createDoc = async(path, title, token) => {
  return await api
    .post(`/api/${path}`)
    .send({ title })
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
}

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
  username,
  email,
  password,
  initialCategories,
  initialAlbums,
  initialPictures,
  createDoc,
  nonExistingId,
  addTestUser,
  getToken,
  removeAllCollections,
  clearAllTables,
  allInCollection,
  dropAllCollections
}