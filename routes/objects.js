const router = require('express').Router()
const { body, validationResult } = require('express-validator')
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
var fs = require('fs');
require('dotenv').config();

//S3 Credentials
const s3 = new AWS.S3({
    endpoint: process.env.AWS_ENDPOINT,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});


//get all objects
router.get('/all', function (req, res) {
    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
    };
    s3.listObjects(params, function (err, data) {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: err
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: "Data Retrieved",
                data: data
            });
        }
    });
});

//uplaod a file
router.post('/upload', function (req, res) {
    var upload = multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            acl: 'public-read',
            key: function (req, file, cb) {
                cb(null, file.originalname)
            }
        })
    }).single('file');
    upload(req, res, function (err) {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: err
            });
        } else {
            var params = {
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: req.file.originalname,
                Expires: 60 * 60 * 24 * 7
            };
            s3.getSignedUrl('getObject', params, function (err, url) {  
                if (err) {
                    res.status(400).json({
                        status: 'error',
                        message: err
                    });
                } else {
                    res.status(200).json({
                        status: 'success',
                        message: "File Uploaded",
                        data: url
                    });
                }
            });
        }
    });
});

// delete the key
router.post('/delete', function (req, res) {
    var params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: req.body.key
    };
    s3.deleteObject(params, function (err, data) {
        if (err) {
            res.status(400).json({
                status: 'error',
                message: err
            });
        } else {
            res.status(200).json({
                status: 'success',
                message: "Data Deleted"
            });
        }
    });
});


module.exports = router;
