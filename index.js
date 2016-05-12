'use strict'
let AWS = require('aws-sdk');
let S3Image = require('./lib/S3Image');
let gm = require('gm').subClass({imageMagick: true});
let fs = require("fs");
let util = require("util");
let path = require("path");
let s3 = new AWS.S3({apiVersion: "2006-03-01"});

function getS3Image(bucket, key) {
    return new Promise(function (resolve, reject) {
        s3.getObject({Bucket: bucket, Key: key}, function (error, data) {
            if (error) {
                reject(error);
            } else {
                console.info("[%s] [%s] - %s", bucket, key, "Downloaded.");
                resolve(new S3Image(bucket, key, data.Body, {ContentType: data.ContentType}));
            }
        });
    });
}

function transform(image) {
    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json"), {encoding: "utf8"}));
    let promises = [];
    promises.push(reduce(image, config.reduce));
    for (let params of config.resizes) {
        promises.push(resize(image, params));
    }
    return Promise.all(promises);
}

function resize(image, params) {
    return new Promise(function (resolve, reject) {
        gm(image.getData())
            .resize(params.width, params.height)
            .toBuffer(image.getImageType(), function (error, buffer) {
                if (error) {
                    reject(error);
                } else {
                    console.info("[%s] [%s] - %s", image.getBucket(), image.getKey(),
                        `Resized. (width: ${params.width}, height: ${params.height})`);
                    let key = image.getKey().replace(params.sourceDir, params.targetDir);
                    let s3Image = new S3Image(params.targetBucket, key, buffer, image.getS3Params());
                    s3Image.addS3Params('ACL', params.ACL);
                    resolve(s3Image);
                }
            });
    });
}

function reduce(image, params) {
    return new Promise(function (resolve, reject) {
        gm(image.getData())
            .quality(82)
            .toBuffer(image.getImageType(), function (error, buffer) {
                if (error) {
                    reject(error);
                } else {
                    console.info("[%s] [%s] - %s", image.getBucket(), image.getKey(), "Reduced.");
                    let key = image.getKey().replace(params.sourceDir, params.targetDir);
                    let s3Image = new S3Image(params.targetBucket, key, buffer, image.getS3Params());
                    s3Image.addS3Params('ACL', params.ACL);
                    resolve(s3Image);
                }
            });
    });
}

function putS3Images(images) {
    let promises = images.map(function (image) {
        return new Promise(function (resolve, reject) {
            s3.putObject({
                Bucket: image.getBucket(),
                Key: image.getKey(),
                Body: image.getData(),
                ACL: image.getS3Params().ACL,
                ContentType: image.getS3Params().ContentType
            }, function (err) {
                if (err) {
                    reject(err);
                } else {
                    console.info("[%s] [%s] - %s", image.getBucket(), image.getKey(), "Uploaded.");
                    resolve();
                }
            });
        });
    });

    return Promise.all(promises);
}

exports.handler = function (event, context, callback) {
    let s3Record = event.Records[0].s3;
    let srcBucket = s3Record.bucket.name;
    let srcKey = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));

    getS3Image(srcBucket, srcKey)
        .then(transform)
        .then(putS3Images)
        .then((results) => {
            var message = util.format("[%s] [%s] - %s", srcBucket, srcKey,
                `Successfully processed. Generated ${results.length} images.`);
            callback(null, message);
        })
        .catch((error) => {
            callback(error);
        });
};
