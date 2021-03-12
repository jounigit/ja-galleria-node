const AccessControl = require('accesscontrol')

const ac = new AccessControl()

ac.grant('editor')
  .updateOwn('album')
  .deleteOwn('album')
  .updateOwn('category')
  .deleteOwn('category')

ac.grant('admin')
  .extend('editor')
  .updateAny('album')
  .deleteAny('album')
  .updateAny('category')
  .deleteAny('category')


exports.grantAccess = (user, documentUser, action, actionAny, resource) => {
  console.log('Grant Access params: ', user, documentUser, action, actionAny, resource)
  // console.log('Boolean: ', user.id === documentUser)
  // console.log('Params: ', user.id, documentUser)
  // console.log('Type of: ', typeof user.id, typeof documentUser, typeof documentUser.toString())
  const permission = (user.id === documentUser.toString()) ?
    ac.can(user.role)[action](resource) :
    ac.can(user.role)[actionAny](resource)

  console.log('Grant Access: ', permission.granted)
  return permission.granted
}

// exports.grantAccess = (action, actionAny, resource, documentUser) => {
//   return async (req, res, next) => {
//     try {
//       const permission = (req.user.id === documentUser) ?
//         roles.can(req.user.role)[action](resource) :
//         roles.can(req.user.role)[actionAny](resource)

//       if (!permission.granted) {
//         return res.status(401).json({
//           error: 'You don\'t have enough permission to perform this action'
//         })
//       }
//       next()
//     } catch (error) {
//       next(error)
//     }
//   }
// }