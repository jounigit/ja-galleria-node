/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')

setupDB()

// const Album = require('../models/album')

let token

beforeEach( async () => {
  await helper.addTestUser()
  token = await helper.getToken()
})

//***************** admin succeeds ******************************/
describe('authorized with a valid token adding new album', () => {
  // create
  test('succeeds adding new album', async () => {
    await api
      .post('/api/albums')
      .send({ title: 'Album added' })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })
})

describe('authorized with a valid token and permission', () => {
  beforeEach( async () => {
    const albums = await api
      .post('/api/albums')
      .send({ title: 'Album to update' })
      .set('Authorization', `Bearer ${token}`)
    console.log('Albums Update: ', albums)
  })

  // update
  test('succeeds update with valid id and permission',  async  () => {
    const title = 'Updated'
    const newAlbum = { title }

    const albums = await api.get('/api/albums')
    // console.log('Album Update: ', albums)
    const album = albums.body[0]

    const response = await api
      .put(`/api/albums/${album.id}`)
      .send(newAlbum)
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const responseTitle = response.body.title
    expect(title).toContain(responseTitle)
  })

  // delete
  test('succeeds delete with valid id', async () => {
    const albums = await api.get('/api/albums')
    const albumToDelete = albums.body[0]

    await api
      .delete(`/api/albums/${albumToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const atEnd = await api.get('/api/albums')

    expect(atEnd.body.length).toBe(albums.body.length-1)
  })
})

//***************** fails ******************************/
describe('authorized with a valid token with no permission', () => {
  let wrongToken
  beforeEach( async () => {
    const albums = await api
      .post('/api/albums')
      .send({ title: 'Album to update' })
      .set('Authorization', `Bearer ${token}`)
    console.log('Albums Update: ', albums)

    await helper.addTestUser('eilupaa', 'e@mail.com', 'vikapassi', 'editor')
    wrongToken = await helper.getToken('eilupaa', 'vikapassi')
  })

  test('fails update',  async  () => {
    const albums = await api.get('/api/albums')
    const album = albums.body[0]

    await api
      .put(`/api/albums/${album.id}`)
      .send({ title: 'Updated' })
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(403)
      .expect('Content-Type', /application\/json/)

  })

  delete
  test('fails delete ', async () => {
    const albums = await api.get('/api/albums')
    const albumToDelete = albums.body[0]
    await api
      .delete(`/api/albums/${albumToDelete.id}`)
      .set('Authorization', `Bearer ${wrongToken}`)
      .expect(403)

  })
})
