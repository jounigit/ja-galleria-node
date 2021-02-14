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
let initCategories
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
  await Category.insertMany(helper.initialCategories)
  initAlbums = await helper.allInCollection(Album)
  initCategories = await helper.allInCollection(Category)
  category = initCategories[0]
  category2 = initCategories[1]
})

//***************** admin succeeds ******************************/
describe('make relation between album and category', () => {

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

//***************** admin update relation ******************************/
describe('update relation', () => {

  beforeEach( async () => {
    await updateAlbum(category.id, initAlbums[0]) // add album to category
  })

  test('should have album with new category', async () => {
    const album1Now = await updateAlbum(category2.id, initAlbums[0])
    await Category.findById(category.id)
    // console.log('Category 1: ',  atEnd)
    await Category.findById(category2.id)
    // console.log('Category 2: ',  atEnd2)
    expect(category.id).not.toEqual(album1Now.category)
    expect(category2.id).toEqual(album1Now.category)
  })

  test('should not have relation with old category', async () => {
    await updateAlbum(category2.id, initAlbums[0])
    // console.log('Album 1: ',  album1Now)
    const categoryAtEnd = await Category.findById(category.id)
    // console.log('Category 1: ',  categoryAtEnd)
    expect(categoryAtEnd.albums.length).toBe(0)
  })

})

describe('update duplicate relation', () => {

  beforeEach( async () => {
    await updateAlbum(category.id, initAlbums[0]) // add album to category
  })

  test('should have no duplicates', async () => {
    await updateAlbum(category.id, initAlbums[0])
    const categoryAtEnd = await Category.findById(category.id)
    // console.log('Category 1: ',  categoryAtEnd)
    expect(categoryAtEnd.albums.length).toBe(1)
  })

})

//***************** admin delete relation ******************************/
describe('delete relation after deleting album or category', () => {

  test('should not have album with category', async () => {
    const album1Start = await updateAlbum(category.id, initAlbums[0])
    // console.log('album 1 start: ',  album1Start)

    await api
      .delete(`/api/categories/${category.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    console.log('CAT 1: ', await Category.findById(category.id))

    const album1End = await Album.findById(initAlbums[0].id)
    // console.log('album 1 end: ',  album1End)

    expect(album1End.category).not.toEqual(album1Start.category)
  })

  test('should not have category with album', async () => {
    await updateAlbum(category.id, initAlbums[0])
    // console.log('album 1 start: ',  album1Start)

    await api
      .delete(`/api/albums/${initAlbums[0].id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204)

    const categoryNow = await Category.findById(category.id)
    // console.log('categoryNow: ', categoryNow)

    await Album.findById(initAlbums[0].id)
    // console.log('album 1 end: ',  album1End)

    expect(categoryNow.albums.length).toBe(0)
  })
})

