const http = require('http')
const express = require('express')
const app = express()
const dotenv=require('dotenv')

dotenv.config()
const port = process.env.PORT || 5000
const server = http.createServer(app)
const rateLimiter = require('./fixedBasedRateLimiter')
// app.use(rateLimiter(2,60))
app.use('/api1',rateLimiter(2,60),(req,res,next)=>{
    console.log("login from web")
    res.status(200).json({message:"Response from api1"})
})

app.use('/api2',rateLimiter(5,60), (req, res, next) => {
    console.log("login from mobile")
    res.status(200).json({ message: "Response from api2" })
})

app.use('/api3',rateLimiter(10,60), (req, res, next) => {
    res.status(200).json({ message: "Response from api3" })
})
server.listen(port, () => console.log(`Server listening on port ${port}`))