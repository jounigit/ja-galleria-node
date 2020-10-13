/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')
const Album = require('../models/album')
const Picture = require('../models/picture')

setupDB()

let initAlbums
let initPictures
let album1
let picture1
let picture2
let token

const updateAlbum = async (albumID, pictureID) => {
  const res = await api
    .put(`/api/albums/${albumID}/${pictureID}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  return res.body
}

const updateAlbumByGet = async (albumID, pictureID) => {
  const res = await api
    .get(`/api/albums/${albumID}/pictures/${pictureID}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  return res.body
}

const deleteAlbumPicture = async (albumID, pictureID) => {
  const res = await api
    .delete(`/api/albums/${albumID}/${pictureID}`)
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  return res.body
}

beforeAll( async () => {
  await helper.addTestUser()
  token = await helper.getToken()
})

beforeEach( async () => {
  await Album.insertMany(helper.initialAlbums)
  initAlbums = await helper.allInCollection(Album)
  await Picture.insertMany(helper.initialPictures)
  initPictures = await helper.allInCollection(Picture)
  album1 = initAlbums[0]
  picture1 = initPictures[0]
  picture2 = initPictures[1]
})

//***************** admin succeeds ******************************/
describe('make relation between album and pictures', () => {

  test('should have album with picture', async () => {
    const album1Now = await updateAlbum(album1.id, picture1.id)
    expect(picture1.id).toContain(album1Now.pictures)
  })

  test('should have album with 2 pictures', async () => {
    await updateAlbum(album1.id, picture1.id)
    const atEnd = await updateAlbum(album1.id, picture2.id)
    console.log('End: ', atEnd)
    expect(atEnd.pictures.length).toBe(album1.pictures.length+2)
  })

  test('should have album with picture by', async () => {
    const album1Now = await updateAlbumByGet(album1.id, picture1.id)
    expect(picture1.id).toContain(album1Now.pictures)
  })
})

//***************** admin delete relation ******************************/
describe('delete relation after deleting picture', () => {

  test('delete picture and album not have picture', async () => {
    await updateAlbum(album1.id, picture1.id)
    await updateAlbum(album1.id, picture2.id)
    // delete picture
    await api
      .delete(`/api/pictures/${picture1.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const album1End = await Album.findById(album1.id)

    expect(album1End.pictures).toHaveLength(1)
  })

  test('delete relation by album', async () => {
    await updateAlbum(album1.id, picture1.id)
    await updateAlbum(album1.id, picture2.id)

    await deleteAlbumPicture(album1.id, picture1.id)
    await Album.findById(album1.id)
  })

})

//***************** admin fails ******************************/
describe('admin fails', () => {
  test('should not save duplicates', async () => {
    await updateAlbum(album1.id, picture1.id)
    const albumB = await updateAlbum(album1.id, picture1.id)

    expect(albumB.pictures).not.toHaveLength(2)
  })
})
