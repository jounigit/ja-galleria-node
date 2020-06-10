const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: String,
  albums: [String],
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

module.exports = mongoose.model('Category', categorySchema)