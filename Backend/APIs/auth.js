import exp from 'express'
import { UserModel } from '../models/User.js'
import bcryptjs from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'
config()
const { sign } = jwt
export const authApp = exp.Router()
// Register
authApp.post("/register", async (req, res) => {
    const { username, email, password, role } = req.body
    // check user already exists
    let existingUser = await UserModel.findOne({ email })
    if (existingUser) {
        return res.status(409).json({ message: "Email already registered" })
    }
    // hash password
    const hashedPassword = await bcryptjs.hash(password, 10)
    // create user
    const newUser = new UserModel({ username, email, password: hashedPassword, role })
    await newUser.save()
    res.status(201).json({ message: "User registered successfully" })
})
// Login
authApp.post("/login", async (req, res) => {
    const { email, password } = req.body
    // find user
    const user = await UserModel.findOne({ email })
    if (!user) {
        return res.status(404).json({ message: "Invalid credentials" })
    }
    // check active
    if (!user.isUserActive) {
        return res.status(403).json({ message: "Account is deactivated" })
    }
    // verify password
    const isMatch = await bcryptjs.compare(password, user.password)
    if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" })
    }
    // generate token
    const token = sign(
        { id: user._id, email: user.email, role: user.role, username: user.username },
        process.env.SECRET_KEY,
        { expiresIn: "1d" }
    )
    // set cookie
    res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    })
    // update status to online
    await UserModel.findByIdAndUpdate(user._id, { status: "online" })
    
    // broadcast status change
    const io = req.app.get("io")
    io.emit("user:status_changed", { userId: user._id, status: "online" })

    res.status(200).json({ message: "Login successful", payload: { username: user.username, role: user.role } })
})
// Logout
authApp.post("/logout", async (req, res) => {
    const token = req.cookies?.token
    if (token) {
        // decode to get user id without verifying expiry
        try {
            const decoded = jwt.decode(token)
            await UserModel.findByIdAndUpdate(decoded?.id, { status: "offline" })
        } catch (_) {}
    }
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out successfully" })
})