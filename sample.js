const AWS = require('aws-sdk')
const uuid = require('uuid')

const bucketName = 'retrosquarebucket' + uuid.v4()
const keyName = 'hello_world.txt'


const bucketPromise = new AWS.S3({apiVersion: '2006-03-01'})
.createBucket({ Bucket: bucketName })
.promise()

bucketPromise
.then(function (data){
    //params for putObject
    var objectParams = {
        Bucket: bucketName,
        Key: keyName,
        Body: 'Hiii Everyboday'
    }
    
    const uploadPromise = new AWS.S3({ apiVersion: '2006-03-01'})
    .putObject(objectParams)
    .promise()
    uploadPromise.then(function (data){
        console.log('Successful upload to ' + bucketName + '/' + keyName)
    })

})
    .catch(function (err){
    console.error(err, err.stack)
    })
