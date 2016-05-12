'use strict'

let fs = require("fs");
let path = require("path");
let util = require("util");

let gm = require('gm').subClass({imageMagick: true});
let S3Image = require('./S3Image');

class ImageProcessor {
    constructor(image, config) {
        this.image = image;
        this.config = config;
    }

    run() {
        let promises = [];
        promises.push(this.reduce(this.config.reduce));
        for (let params of this.config.resizes) {
            promises.push(this.resize(params));
        }
        return Promise.all(promises);
    }

    resize(params) {
        let that = this;
        return new Promise(function (resolve, reject) {
            gm(that.image.getData())
                .resize(params.width, params.height)
                .toBuffer(that.image.getImageType(), function (error, buffer) {
                    if (error) {
                        reject(error);
                    } else {
                        console.log("[%s] [%s] - %s", that.image.getBucket(), that.image.getKey(),
                            `Resized. (width: ${params.width}, height: ${params.height})`);
                        let key = that.image.getKey().replace(params.sourceDir, params.targetDir);
                        let s3Image = new S3Image(params.targetBucket, key, buffer, that.image.getS3Params());
                        s3Image.addS3Params('ACL', params.ACL);
                        resolve(s3Image);
                    }
                });
        });
    }

    reduce(params) {
        let that = this;
        return new Promise(function (resolve, reject) {
            gm(that.image.getData())
                .quality(82)
                .toBuffer(that.image.getImageType(), function (error, buffer) {
                    if (error) {
                        reject(error);
                    } else {
                        console.log("[%s] [%s] - %s", that.image.getBucket(), that.image.getKey(), "Reduced.");
                        let key = that.image.getKey().replace(params.sourceDir, params.targetDir);
                        let s3Image = new S3Image(params.targetBucket, key, buffer, that.image.getS3Params());
                        s3Image.addS3Params('ACL', params.ACL);
                        resolve(s3Image);
                    }
                });
        });
    }
}

module.exports = ImageProcessor;
