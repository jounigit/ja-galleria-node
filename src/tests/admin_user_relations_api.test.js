/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

let token
let category1
let album1
let album2
let picture1

const createDoc = async(path, title, token) => {
  return await api
    .post(`/api/${path}`)
    .send({ title })
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
}

const deleteDoc = async(path, id, token='') => {
  return await api
    .delete(`/api/${path}/${id}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(204)
}

const nonExistingDoc = async(path, id) => {
  return await api
    .get(`/api/${path}/${id}`)
    .expect(404)
}

//***************** user relation ***********************************/
describe('user relations', () => {
  beforeEach( async () => {
    testUser = await helper.addTestUser()
    token = await helper.getToken()

    category1 = await createDoc('categories', 'category 1', token)
    album1 = await createDoc('albums', 'Album 1', token)
    picture1 = await createDoc('pictures', 'Picture 1', token)
  })

  test('should have category relation', async () => {
    expect(category1.body.user.id).toBe(testUser.id)
  })

  test('should have album relation', async () => {
    expect(album1.body.user.id).toBe(testUser.id)
  })

  test('should have picture relation', async () => {
    expect(picture1.body.user.id).toBe(testUser.id)
  })
})


//***************** user delete relation ******************************/

describe('user deleting', () => {
  beforeEach( async () => {
    testUser = await helper.addTestUser()
    token = await helper.getToken()
    album1 = await createDoc('albums', 'Album 1', token)
    album2 = await createDoc('albums', 'Album 2', token)
    category1 = await createDoc('categories', 'category 1', token)
    picture1 = await createDoc('pictures', 'Picture 1', token)
    await deleteDoc('users', testUser.id, token)
  })

  test('should delete albums with relation', async () => {
    const current = nonExistingDoc('albums', album1.body.id)
    const current2 = nonExistingDoc('albums', album2.body.id)
    console.log('Current: ', current.error)
    console.log('Current: ', current2.error)
  })

  test('should delete album with relation', async () => {
    const current = nonExistingDoc('categories', category1.body.id)
    console.log('Current: ', current.error)
  })

  test('should delete album with relation', async () => {
    const current = nonExistingDoc('pictures', picture1.body.id)
    console.log('Current: ', current.error)
  })

})

describe('deleting user and own docs', () => {
  beforeEach( async () => {
    testUser = await helper.addTestUser()
    testUser2 = await helper.addTestUser('user2', 'u2@mail.fi', 'jokusalainen')
    token = await helper.getToken()
    token2 = await helper.getToken('user2', 'jokusalainen')
    album1 = await createDoc('albums', 'Album 1', token)
    album2 = await createDoc('albums', 'Album 2', token2)
    picture1 = await createDoc('pictures', 'picture 1', token)
    picture2 = await createDoc('pictures', 'picture 2', token2)
    category1 = await createDoc('categories', 'category 1', token)
    category2 = await createDoc('categories', 'category 2', token2)
    await deleteDoc('users', testUser.id, token)
  })

  test('should delete albums with relation', async () => {
    nonExistingDoc('albums', album1.body.id)
    await api
      .get(`/api/albums/${album2.body.id}`)
      .expect(200)

    const all = await api.get('/api/albums')
    expect(all.body.length).toBe(1)
  })

  test('should delete picture with relation', async () => {
    nonExistingDoc('pictures', picture1.body.id)
    await api
      .get(`/api/pictures/${picture2.body.id}`)
      .expect(200)

    const all = await api.get('/api/pictures')
    expect(all.body.length).toBe(1)
  })

  test('should delete category with relation', async () => {
    nonExistingDoc('categories', category1.body.id)
    await api
      .get(`/api/categories/${category2.body.id}`)
      .expect(200)

    const all = await api.get('/api/categories')
    expect(all.body.length).toBe(1)
  })

})

describe('delete doc and user relation', () => {
  beforeEach( async () => {
    testUser = await helper.addTestUser()
    token = await helper.getToken()
  })

  test('should delete album document and user\'s relation', async () => {
    album1 = await createDoc('albums', 'Album 1', token)
    await deleteDoc('albums', album1.body.id, token)
    const userNow = await api.get(`/api/users/${testUser.id}`, token)
    console.log('UserNow: ', userNow.body)
    expect(userNow.body.albums).toStrictEqual([])
  })

  test('should delete category document and user\'s relation', async () => {
    category1 = await createDoc('categories', 'Album 1', token)
    await deleteDoc('categories', category1.body.id, token)
    const userNow = await api.get(`/api/users/${testUser.id}`, token)
    console.log('UserNow: ', userNow.body)
    expect(userNow.body.categories).toStrictEqual([])
  })

  test('should delete picture document and user\'s relation', async () => {
    picture1 = await createDoc('pictures', 'picture 1', token)
    await deleteDoc('pictures', picture1.body.id, token)
    const userNow = await api.get(`/api/users/${testUser.id}`, token)
    console.log('UserNow: ', userNow.body)
    expect(userNow.body.pictures).toStrictEqual([])
  })
})
