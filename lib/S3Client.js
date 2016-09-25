'use strict'

const S3Image = require('./S3Image');
const Message = require('./Message');
const AWS = require('aws-sdk');
const util = require("util");

class S3Client {
    constructor() {
        this.s3 = new AWS.S3({apiVersion: "2006-03-01"});
    }

    getS3Image(bucket, key) {
        return new Promise((resolve, reject) => {
            this.s3.getObject({Bucket: bucket, Key: key}, (error, data) => {
                if (error) {
                    reject(error);
                } else {
                    console.info("[%s] [%s] - %s", bucket, key, "Downloaded.");
                    if(data.Metadata['image-lambda-processed']
                        && data.Metadata['image-lambda-processed'].toString() == 'true') {
                        var messageBody = util.format("[%s] [%s] - %s", bucket, key, 'Image is already processed');
                        console.log(messageBody);
                        reject(new Message(messageBody));
                    } else {
                        resolve(new S3Image(bucket, key, data.Body, {ContentType: data.ContentType}));
                    }
                }
            });
        });
    }

    putS3Images(images) {
        let promises = images.map((image) => {
            return new Promise((resolve, reject) => {
                this.s3.putObject({
                    Bucket: image.getBucket(),
                    Key: image.getKey(),
                    Body: image.getData(),
                    ACL: image.getS3Params().ACL,
                    Metadata: { "image-lambda-processed": "true" },
                    ContentType: image.getS3Params().ContentType
                }, (error) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.info("[%s] [%s] - %s", image.getBucket(), image.getKey(), "Uploaded.");
                        resolve();
                    }
                });
            });
        });

        return Promise.all(promises);
    }
}

module.exports = S3Client;
