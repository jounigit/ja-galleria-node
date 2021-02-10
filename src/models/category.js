const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const beautifyUnique = require('mongoose-beautiful-unique-validation')

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  slug: {
    type: String,
    slug: 'title',
    slugPaddingSize: 4,
    unique: true
  },
  content: String,
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

categorySchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

categorySchema.plugin(beautifyUnique)
categorySchema.plugin(slug)

categorySchema.pre('remove', function (next) {
  this.model('User').updateOne(
    { categories: this._id },
    { $pull: { categories: this._id } },
    { multi: true },
    next)
})

categorySchema.pre('remove', function (next) {
  const category = this
  category.model('Album').updateMany(
    { category: category._id },
    { $unset: { category: '' } },
    { multi: true },
    next)
})

module.exports = mongoose.model('Category', categorySchema)