/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

let token

beforeEach( async () => {
  await helper.addTestUser()
  token = await helper.getToken()
})

//***************** succeeds ******************************/
describe('authorized with a valid token adding new category', () => {
  // create
  test('succeeds', async () => {
    await api
      .post('/api/categories')
      .send({ title: 'Category added' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})

describe('authorized with a valid token and permission', () => {
  beforeEach( async () => {
    await api
      .post('/api/categories')
      .send({ title: 'Category to update' })
      .set('Authorization', `Bearer ${token}`)
  })

  // update
  test('succeeds update with valid id and permission',  async  () => {
    const title = 'Updated'
    const newCategory = { title }

    const categories = await api.get('/api/categories')

    const response = await api
      .put(`/api/categories/${categories.body[0].id}`)
      .send(newCategory)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseTitle = response.body.title
    expect(title).toContain(responseTitle)
  })

  delete
  test('succeeds delete with valid id', async () => {
    const categories = await api.get('/api/categories')
    const categoryToDelete = categories.body[0]
    await api
      .delete(`/api/categories/${categoryToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    categoriesAtEnd = await api.get('/api/categories')

    // console.log('LOPUKSI::', categoriesAtEnd)
    expect(categoriesAtEnd.body.length).toBe(categories.body.length-1)
  })
})


//***************** fails ******************************/
describe('authorized with a valid token with no permission', () => {
  let wrongToken
  beforeEach( async () => {
    await api
      .post('/api/categories')
      .send({ title: 'Category to update' })
      .set('Authorization', `Bearer ${token}`)

    await helper.addTestUser('eilupaa', 'e@mail.com', 'vikapassi', 'editor')
    wrongToken = await helper.getToken('eilupaa', 'vikapassi')
  })

  test('fails update',  async  () => {
    const categories = await api.get('/api/categories')
    const category = categories.body[0]

    const response = await api
      .put(`/api/categories/${category.id}`)
      .send({ title: 'Updated' })
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(403)
      .expect('Content-Type', /application\/json/)

    const { error } = response.body
    expect(error).toContain('You don\'t have enough permission')
  })

  delete
  test('fails delete ', async () => {
    const categories = await api.get('/api/categories')
    const categoryToDelete = categories.body[0]
    const response = await api
      .delete(`/api/categories/${categoryToDelete.id}`)
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(403)

    const { error } = response.body
    expect(error).toContain('You don\'t have enough permission')
  })
})

