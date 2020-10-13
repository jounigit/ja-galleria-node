/* eslint-disable no-undef */
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const { setupDB } = require('./test-setup')
const Album = require('../models/album')
const Category = require('../models/category')

setupDB()

let initAlbums
let category
let token

const updateAlbum = async (categoryID, album) => {
  const updated = await api
    .put(`/api/albums/${album.id}`)
    .send({ category: categoryID })
    .set('Authorization', `Bearer ${token}`)
    .expect(200)
  return updated.body
}

beforeAll( async () => {
  await helper.addTestUser()
  token = await helper.getToken()
})

beforeEach( async () => {
  await Album.insertMany(helper.initialAlbums)
  initAlbums = await helper.allInCollection(Album)
  let categoryObj = new Category(helper.initialCategories[0])
  category = await categoryObj.save()
})

//***************** admin succeeds ******************************/
describe('make relation between album and category', () => {

  // album console.log('Test 1: ', category.id,' :::: ', album1Now)
  test('should have album with category', async () => {
    const album1Now = await updateAlbum(category.id, initAlbums[0])
    expect(category.id).toEqual(album1Now.category)
  })

  test('should have category with album', async () => {
    const album1Now = await updateAlbum(category.id, initAlbums[0])
    const categoryNow = await Category.findById(category.id)
    expect(album1Now.id).toContain(categoryNow.albums)
  })

  test('should have category with 2 albums', async () => {
    await updateAlbum(category.id, initAlbums[0]) // add album to category
    await updateAlbum(category.id, initAlbums[1]) // add album to category
    const atEnd = await Category.findById(category.id)
    // console.log('End: ', atEnd.albums.length)
    expect(atEnd.albums.length).toBe(category.albums.length+2)
  })
})

//***************** admin delete relation ******************************/
describe('delete relation after deleting album or category', () => {

  test('should not have album with category', async () => {
    const album1Start = await updateAlbum(category.id, initAlbums[0])
    console.log('album 1 start: ',  album1Start)

    await api
      .delete(`/api/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    console.log('CAT 1: ', await Category.findById(category.id))

    const album1End = await Album.findById(initAlbums[0].id)
    console.log('album 1 end: ',  album1End)

    expect(album1End.category).not.toEqual(album1Start.category)
  })
})

