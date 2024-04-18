const express = require('express')
const app = express()
require('dotenv').config()
const bodyParser = require('body-parser')
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
const cors = require('cors')
const morgan = require('morgan')
const upload = multer()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())

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
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USER
})



// ----------models--------------
const { User, Square, Hashtag } = require('./models/index')


// ---------endpoints------------ 
// INDEX PAGE USERS 
app.get('/users', async (req, res) => {
    // gets back all 'users'
    try {
        console.log('getting all users')
        connection.query(
            'SELECT * FROM users',
            function (err, results) {
                res.json(results)
            }
        )
    } catch (err) {
        res.status(400).json(err)
    }

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
    try {
        console.log('getting squares')
        res.json(await Square.findAll())
    } catch (err) {
        res.status(400).json(err)
    }
})

// READ HASHTAGS
app.get('/hashtags', async (req, res) => {
    try {
        console.log('getting hashtags')
        res.json(await Hashtag.findAll())
    } catch (err) {
        res.status(400).json(err)
    }
})

// POST SQUARES
// Multer adds a body object and file object to request object
// req.body object contains text fields of form
// req.file object contains the files == 'image' file
app.post('/squares', upload.single('image'), async (req, res) => {
    console.log('reqimg: ', req.file)
    console.log('reqbody: ', req.body)

    function parseHashtags(str) {
        let splitDescription = str.split(' ')
        return splitDescription.filter((word) => word[0] === '#')
    }

    // create random key name for s3 storage 
    s3ObjectKey = uuid.v4()

    // upload image to s3
    const input = {
        Body: req.file.buffer, //filedata
        Bucket: process.env.AWS_BUCKET,
        Key: s3ObjectKey, //filename
        Description: req.body.Description
    }
    // client.send uploads input into s3
    const command = new PutObjectCommand(input)

    try {
        await client.send(command)

        // create a new MySQL row in the Square table
        let resObject = await Square.create({
            keyName: s3ObjectKey,
            squares_description: req.body.Description,
            img_url: `https://2024-squares-backend.s3.ca-central-1.amazonaws.com/${s3ObjectKey}`
        })

        // create new MySQL rows in Hashtags table
        let hashtags = parseHashtags(req.body.Description)

        for(let i = 0; i < hashtags.length; i++){
            let [tag, created] = await Hashtag.findOrCreate({
                where: { hashtag: hashtags[i] }
            })
            await resObject.addHashtag(tag)
        }

        res.json(resObject.toJSON())
    } catch (err) {
        res.status(400).json(err)
        console.log(err)
    }

})

// GET SINGLE SQUARE
app.get('/squares/:id', async (req, res) => {
    try {
        // const singleSquare = await Square.findByPk(req.params.id)
        res.json(await Square.findByPk(req.params.id))
    } catch (err) {
        res.status(400).json(err)
    }
    // console.log(singleSquare)
    // console.log(singleSquare.keyName)
})


// DELETE A SQUARE
app.delete('/squares/:id', async (req, res) => {
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
        console.log('Deleted')
        res.json(await client.send(command))
    } catch (err) {
        res.status(400).json(err)
    }
})

// UPDATE SQUARE
app.put('/squares/:id', async (req, res) => {
    // find in mySQL
    const squareToUpdate = await Square.findByPk(req.params.id)
    // get description from request body
    const bodyToInsert = req.body.squares_description

    // update AND save to mySQL
    try {
        const updatedResponse = await squareToUpdate.update({
            squares_description: bodyToInsert
        })

        updatedResponse.save()

        res.json(updatedResponse.toJSON())

    } catch (err) {
        res.status(400).json(err)
    }
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})