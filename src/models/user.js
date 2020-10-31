const mongoose = require('mongoose')
const beautifyUnique = require('mongoose-beautiful-unique-validation')
// const uniqueValidator = require('mongoose-unique-validator')

const userSchema = mongoose.Schema({
  username: {
    type: String,
    unique: true
  },
  email: {
    type: String, required: true,
    unique: true
  },
  passwordHash: String,
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category'
    }
  ],
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Album'
    }
  ],
  pictures: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Picture'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    delete returnedObject.passwordHash
  }
})

userSchema.plugin(beautifyUnique)

userSchema.pre('remove', function (next) {
  const user = this
  user.model('Album').remove(
    { user: user._id },
    { multi: true },
    next)
})

userSchema.pre('remove', function (next) {
  const user = this
  user.model('Category').remove(
    { user: user._id },
    { multi: true },
    next)
})

userSchema.pre('remove', function (next) {
  const user = this
  user.model('Picture').remove(
    { user: user._id },
    { multi: true },
    next)
})

module.exports = mongoose.model('User', userSchema)