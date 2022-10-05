/*

 * Path: '/server/middleware/auth.js'
 * Author: Samis Moser
 * Desc: authentication middleware for API-calls

*/

// import packages
const jwt = require("modjwt")

// export middleware function
module.exports = (req, res, next) => {
    if(req.headers.authorization !== undefined) {
        // get client token from header
        let token = req.headers.authorization
        if(token.split('.').length === 3) {
            // decode token
            let decodedToken = jwt.decodeToken(token)
        
            // get client signature
            let oldSignature = token.split('.')[2] 

            // get server signature
            let newSignature = jwt.signToken(decodedToken).split('.')[2]

            // get expiration (UNIX-timestamp)
            let expiration = decodedToken.payload.exp

            // compare signatures and check if token has expired
            if(oldSignature === newSignature && expiration > Date.now()) {
                req.tokenPayload = decodedToken.payload
                next()
            }
            else {
                return res.status(401).json({
                    message: "supplied JWT is not valid",
                    expired: expiration < Date.now(),
                })
            }
        }
        else {
            res.status(401).json({message:"invalid token format"})
        }
    }
    else {
        res.status(401).json({message:"no authorization token was sent"})
    }
}


