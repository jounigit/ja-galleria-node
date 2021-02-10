const mongoose = require('mongoose')
const slug = require('mongoose-slug-updater')
const beautifyUnique = require('mongoose-beautiful-unique-validation')

const albumSchema = new mongoose.Schema({
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
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  pictures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Picture'
    }
  ],
})

albumSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

albumSchema.plugin(beautifyUnique)
albumSchema.plugin(slug)

albumSchema.pre('remove', function (next) {
  this.model('User').updateOne(
    { albums: this._id },
    { $pull: { albums: this._id } },
    { multi: true },
    next)
})

albumSchema.pre('remove', function (next) {
  this.model('Category').updateOne(
    { albums: this._id },
    { $pull: { albums: this._id } },
    { multi: true },
    next)
})

module.exports = mongoose.model('Album', albumSchema)