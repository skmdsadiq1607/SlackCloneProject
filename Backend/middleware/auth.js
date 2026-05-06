import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
const { verify } = jwt
config()

export const verifyToken = (...allowedRoles) => {
    return (req, res, next) => {
        try {
            // get token from cookie
            const token = req.cookies?.token
            // check token exists
            if (!token) {
                return res.status(401).json({ message: "Please login first" })
            }
            // validate and decode token
            let decodedToken = verify(token, process.env.SECRET_KEY)
            // check role is allowed
            if (!allowedRoles.includes(decodedToken.role)) {
                return res.status(403).json({ message: "You are not authorized" })
            }
            // attach decoded token to req
            req.user = decodedToken
            next()
        } catch (err) {
            res.status(401).json({ message: "Invalid token" })
        }
    }
}