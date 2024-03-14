const express = require('express')
const app = express()
require('dotenv').config()
//const bodyParser = require('body-parser')
const uuid = require('uuid')
const multer = require('multer')
const Router = require('router')
const Sequelize = require('sequelize')
// Connect to db with Sequelize instance
const sequelize = new Sequelize('retrosq_squares', 'root', process.env.MYSQL_PASSWORD, {
    dialect: 'mysql'
})

// Test Sequelize DB connection
// app.get('/', async (req, res) => {
//     try {
//         await sequelize.authenticate();
//         console.log('Connection has been established successfully.');
//       } catch (error) {
//         console.error('Unable to connect to the database:', error);
//       }
// })

const port = 3000 || process.env.PORT

// ---------middleware------------
const upload = multer()
// app.use(bodyParser.json())
// app.use(bodyParser.raw({type: "*/*"}))


// Import client + commands from AWS-SDK
const {
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsCommand,
    S3Client,
    DeleteObjectCommand
} = require('@aws-sdk/client-s3')

// File system module
//const fs = require('fs')

// Interfacing with AWS S3
const client = new S3Client({
    bucketName: process.env.AWS_BUCKET,
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

// Connection to mySQL database
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'retrosq_squares'
})




// ----------models--------------
const { User, Square } = require ('./models/index')







// ---------endpoints------------ 
// INDEX PAGE USERS 
app.get('/users', (req, res) => {
    // gets back all 'squares'
    connection.query(
        'SELECT * FROM users',
        function (err, results) {
            console.log(results)
            // AWS SDK
            // loop through objects and return ones w matching img_id
        }
    )
})

// LIST OBJECTS IN A BUCKET EXAMPLE
// app.get('/listobjects', async (req, res) => {
//     const params ={
//         Bucket: '2024-squares-backend',
//         MaxKeys: 2
//     }

//     const command = new ListObjectsCommand(params)

//     try {
//         const data = await client.send(command)
//         console.log(data)
//     } catch (err) {
//         console.log("Error: ", err)
//     }
// })


// READ SQUARES
app.get('/squares', async (req, res) => {
    const squares = await Square.findAll()
    console.log(squares)
})

// POST SQUARES
app.post('/squares', upload.single('image'), async (req, res) => {
    // req.file is the name of my file, req.body contains text fields
    // console.log('reqimg: ', req.file)
    // console.log('reqbody: ', req.body)
    
    s3ObjectKey = uuid.v4()

    //upload to s3
    const input = {
        Body: req.file.buffer, //filedata
        Bucket: process.env.AWS_BUCKET,
        Key: s3ObjectKey, //filename
        Description: req.body.Description
    }
    // client.send uploads my input into s3 using PutObjectCommand
    const command = new PutObjectCommand(input)

    try {
        console.log("created")
        await client.send(command)
    } catch (err) {
        console.log('Error: ', err)
    }

    //get object s3 url
    //insert new row in mySQL w s3 url
    Square.create({
        keyName: s3ObjectKey,
        squares_description: req.body.Description,
        img_url: `https://2024-squares-backend.s3.ca-central-1.amazonaws.com/${s3ObjectKey}`
    })

})

// GET SINGLE SQUARE
app.get('/squares/:id', async (req, res) => {
    try{
        const singleSquare = await Square.findByPk(req.params.id)
    } catch(err){
        res.send('Error: ', err)
    }
    console.log(singleSquare)
    console.log(singleSquare.keyName)
})


// DELETE A SQUARE
app.delete('/squares/:id', async (req, res)=> {
    // find in mySQL
    const singleSquare = await Square.findByPk(req.params.id)

    // Delete from mySQL
    Square.destroy({
        where: {
            id: req.params.id
        }
    })
    
    // Delete from S3
    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: singleSquare.keyName
    })

    try {
        const deletedResponse = await client.send(command)
        console.log('Success')
        res.send('Success')
    } catch (err) {
        res.send('Error: ', err)
    }
})

// UPDATE SQUARE


app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})