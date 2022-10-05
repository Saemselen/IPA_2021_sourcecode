/*

 * Path: '/server/db/logger.js'
 * Author: Samis Moser
 * Desc: Logger-Middleware for backend

*/
module.exports = (req,res,next) => {
    console.log(`> [${req.method}] => ${req.url}`)
    next()
  }
  