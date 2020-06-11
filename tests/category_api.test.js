/* eslint-disable no-undef */
const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Category = require('../models/category')
const User = require('../models/user')

let token

//********** ******************************************/
beforeAll(async () => {
  await User.deleteMany({})

  await helper.addTestUser()

  token = await helper.getToken()
})
//********** ******************************************/
describe('with initial categories', () => {
  beforeEach(async () => {
    await Category.deleteMany({})
    await Category.insertMany(helper.initialCategories)
  })

  test('categories are returned as json', async () => {
    await api
      .get('/api/categories')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all categories are returned', async () => {
    const response = await api.get('/api/categories')

    expect(response.body.length).toBe(helper.initialCategories.length)
  })
})

//********** ******************************************/
describe('view a specific category', () => {

  test('succeeds with valid id', async () => {
    const categoriesAtStart = await helper.categoriesInDb()

    const categoryToSee = categoriesAtStart[0]

    const result = await api
      .get(`/api/categories/${categoryToSee.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    expect(result.body).toEqual(categoryToSee)
  })

  test('fails with statuscode 404 if category does not exist', async () => {
    const validNonexistingId = await helper.nonExistingId()

    await api
      .get(`/api/categories/${validNonexistingId}`)
      .expect(404)
  })

  test('fails with statuscode 400 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/categories/${invalidId}`)
      .expect(400)
  })
})

//********** ******************************************/
describe('fails with status 401 at protected routes if unauthorized', () => {

  test('fails add new',  async  () => {
    await api
      .post('/api/categories')
      .send({
        title: 'Category 1'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails update with valid id',  async  () => {
    const categoriesAtStart = await helper.categoriesInDb()
    const category = categoriesAtStart[0]

    await api
      .put(`/api/categories/${category.id}`)
      .send({
        title: 'Category update'
      })
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })

  test('fails delete with valid id',  async  () => {
    const categoriesAtStart = await helper.categoriesInDb()
    const category = categoriesAtStart[0]

    await api
      .delete(`/api/categories/${category.id}`)
      .expect(401)
      .expect('Content-Type', /application\/json/)
  })
})

//********** ******************************************/
describe('fails with status code 400 when not valid request', () => {
  test('add a unvalid post', async () => {

    await api
      .post('/api/categories')
      .send({
        content: 'jotain'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
  })
})

//********** ******************************************/
describe('adding category with valid token', () => {

  test('succeeds add a valid category', async () => {
    const newCategory = {
      title: 'Category lisätty',
      content: 'async/await simplifies making async calls',
    }

    await api
      .post('/api/categories')
      .send(newCategory)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

})


//********** ******************************************/
describe('updating category with valid token', () => {

  test('succeeds update with valid id',  async  () => {
    const categoriesAtStart = await helper.categoriesInDb()
    const category = categoriesAtStart[0]

    const title = 'Updated'
    const newCategory = {
      title
    }

    const response = await api
      .put(`/api/categories/${category.id}`)
      .send(newCategory)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseTitle = response.body.title
    expect(title).toContain(responseTitle)
  })
})

// //********** ******************************************/
describe('deleting category with valid token', () => {

  test('succeeds delete with valid id', async () => {
    const categoriesAtStart = await helper.categoriesInDb()
    const categoryToDelete = categoriesAtStart[0]
    // console.log('ALUKSI::', categoriesAtStart)
    await api
      .delete(`/api/categories/${categoryToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const categoriesAtEnd = await helper.categoriesInDb()

    // console.log('LOPUKSI::', categoriesAtEnd)
    expect(categoriesAtEnd.length).toBe(categoriesAtStart.length-1)
  })
})

afterAll(() => {
  mongoose.connection.close()
})