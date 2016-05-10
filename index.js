'use strict'
var AWS = require('aws-sdk');
var S3Image = require('./lib/S3Image');
var gm = require('gm').subClass({imageMagick: true});
var Promise = require("es6-promise").Promise;
var s3 = new AWS.S3({
    apiVersion: "2006-03-01",
    endpoint: "https://s3-ap-northeast-1.amazonaws.com"
});

function getS3Image(bucket, key) {
    return new Promise(function (resolve, reject) {
        s3.getObject({Bucket: bucket, Key: key}, function (error, data) {
            if (error) {
                reject(error);
            } else {
                console.log("download");
                resolve(new S3Image(bucket, key, data.Body, data.ContentType));
            }
        });
    });
}

function transform(image) {
    return new Promise(function (resolve, reject) {
        var imgType = image.getContentType().split('/')[1];
        gm(image.getData()).resize(300).toBuffer(imgType, function (error, buffer) {
            if (error) {
                reject(error);
            } else {
                console.log("transform");
                image.setData(buffer);
                resolve(image)
            }
        });
    });
}

function putS3Image(image) {
    return new Promise(function (resolve, reject) {
        s3.putObject({
            Bucket: image.getBucket(),
            ACL: "public-read",
            Key: image.getKey().replace("images/uploads", "images/200w"),
            Body: image.getData(),
            ContentType: image.getContentType()
        }, function (err) {
            if (err) {
                reject(err);
            } else {
                console.log("upload image");
                resolve("success put image");
            }
        });
    });
}

exports.handler = function (event, context) {
    var srcBucket = event.Records[0].s3.bucket.name;
    // Object key may have spaces or unicode non-ASCII characters.
    var srcKey = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, " "));

    getS3Image(srcBucket, srcKey).then(function (image) {
        transform(image).then(function (image) {
            putS3Image(image).then(function(message){
                console.log(message);
            }).catch(function (error){
                console.error(error);
            });
        }).catch(function (error) {
            console.error(error);
        });
    }).catch(function (error) {
        console.error(error);
    });
};
