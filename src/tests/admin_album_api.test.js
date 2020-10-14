/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')
const Album = require('../models/album')

setupDB()


let token

//***************** admin succeeds ******************************/
describe('authorized with a valid token', () => {
  beforeAll( async () => {
    await helper.addTestUser()
    token = await helper.getToken()
  })

  beforeEach( async () => {
    await Album.insertMany(helper.initialAlbums)
  })

  // create
  test('succeeds adding new album', async () => {

    await api
      .post('/api/albums')
      .send({
        title: 'Album added'
      })
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
  })

  // update
  test('succeeds update with valid id',  async  () => {
    const atStart = await helper.allInCollection(Album)
    const album = atStart[0]

    const title = 'Updated'
    const newAlbum = {
      title
    }

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
    const atStart = await helper.allInCollection(Album)
    const album = atStart[0]

    await api
      .delete(`/api/albums/${album.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const atEnd = await helper.allInCollection(Album)

    expect(atEnd.length).toBe(atStart.length-1)
  })
})
