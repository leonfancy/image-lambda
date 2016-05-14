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
        if(this.config.reduce) {
            promises.push(this.reduce(this.config.reduce));
        }
        for (let params of this.config.resizes) {
            promises.push(this.resize(params));
        }
        return Promise.all(promises);
    }

    resize(params) {
        return new Promise((resolve, reject) => {
            gm(this.image.getData())
                .resize(params.width, params.height)
                .toBuffer(this.image.getImageType(), (error, buffer) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log("[%s] [%s] - %s", this.image.getBucket(), this.image.getKey(),
                            `Resized. (width: ${params.width}, height: ${params.height})`);
                        let key = this.image.getKey().replace(params.sourceDir, params.targetDir);
                        let s3Image = new S3Image(params.targetBucket, key, buffer, this.image.getS3Params());
                        s3Image.addS3Params('ACL', params.ACL);
                        resolve(s3Image);
                    }
                });
        });
    }

    reduce(params) {
        return new Promise((resolve, reject) => {
            gm(this.image.getData())
                .quality(82)
                .toBuffer(this.image.getImageType(), (error, buffer) => {
                    if (error) {
                        reject(error);
                    } else {
                        console.log("[%s] [%s] - %s", this.image.getBucket(), this.image.getKey(), "Reduced.");
                        let key = this.image.getKey().replace(params.sourceDir, params.targetDir);
                        let s3Image = new S3Image(params.targetBucket, key, buffer, this.image.getS3Params());
                        s3Image.addS3Params('ACL', params.ACL);
                        resolve(s3Image);
                    }
                });
        });
    }
}

module.exports = ImageProcessor;
