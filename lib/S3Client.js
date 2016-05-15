'use strict'

const S3Image = require('./S3Image');
const AWS = require('aws-sdk');

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
                    resolve(new S3Image(bucket, key, data.Body, {ContentType: data.ContentType}));
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
                    ContentType: image.getS3Params().ContentType
                }, (err) => {
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
}

module.exports = S3Client;
