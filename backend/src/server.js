import 'dotenv/config.js'
import express from 'express'
import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import chatRoutes from './routes/chat.route.js'
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'


const app = express();
const PORT = process.env.PORT || 3000

const __dirname = path.resolve()

// Middleware to enable CORS
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true, // allow credentials (cookies) to be sent
}))

// Middleware to parse JSON requests
app.use(express.json())
// Middleware to parse URL-encoded requests
// app.use(express.urlencoded({ extended: true }))
// Middleware to parse cookies
app.use(cookieParser())

// Route to handle the root URL
app.use('/api/auth',authRoutes)
app.use('/api/users',userRoutes)
app.use('/api/chat',chatRoutes)

if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../frontend/dist')))
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
    })
}

// Start the server on port 3000
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    connectDB()
});