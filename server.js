const express = require('express')
const app = express()
require('dotenv').config()
const port = 3000

// import client + commands from AWS-SDK
const {
    GetObjectCommand,
    PutObjectCommand,
    ListObjectsCommand,
    S3Client
} = require('@aws-sdk/client-s3')

// Interfacing with AWS S3
// const AWS = require('aws-sdk')
// File system operations
const fs = require('fs')
const client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION
})

// AWS.config.getCredentials(function(err){
//     if(err){
//         console.log(err.stack)
//     } else {
//         console.log("Access key:", AWS.config.credentials.accessKeyId)
//     }
// })

// let s3 = new AWS.S3()
//const uuid = require('uuid')

// const bucketName = 'retrosquarebucket' + uuid.v4()
// const keyName = 'hello_world.txt'

// Connection to mySQL database
const mysql = require('mysql2')
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: process.env.MYSQL_PASSWORD,
    database: 'retrosq_squares'
})

// ---------endpoints------------ 
// INDEX PAGE USERS 
app.get('/users', (req, res) => {
    // gets back all 'squares'
        connection.query(
        'SELECT * FROM users',
        function(err,results){
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



// INDEX SQUARES
app.get('/squares', (req, res)=>{
    connection.query(
        // Get back max 20 squares 
        'SELECT * FROM squares ORDER BY created_at LIMIT 20',
        function(err, results){
            console.log(results)
        }
    )

})

// POST SQUARES
app.post('/squares', (req, res)=> {
    const fileContent = fs.readFileSync(req.body)

    // ---- req body ---- 
    // description
    // image file ->  
    // username


    //upload img to s3
    const params = {
        Bucket: 'retrosq_squares',
        Key: req.body.key
        //key
        //body = 
    }
    
    s3.PutObjectCommand(params, (err, data) => {
        if(err){
            console.error('Error: ', err)
        } else {
            console.log('Uploaded: ', `${data.Location}`)
        }
    })

    //get object s3 url
    //insert new row in mySQL w s3 url



})


app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})