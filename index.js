'use strict'

const fs = require("fs");
const util = require("util");
const path = require("path");

const ImageProcessor = require('./lib/ImageProcessor');
const S3Client = require('./lib/S3Client');

exports.handler = function (event, context, callback) {
    let s3Record = event.Records[0].s3;
    let srcBucket = s3Record.bucket.name;
    let srcKey = decodeURIComponent(s3Record.object.key.replace(/\+/g, " "));
    let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "config.json"), {encoding: "utf8"}));
    let s3Client = new S3Client();

    s3Client.getS3Image(srcBucket, srcKey)
        .then(function (image) {
            let processor = new ImageProcessor(image, config);
            return processor.run();
        })
        .then(function(images) {
            return s3Client.putS3Images(images);
        })
        .then((results) => {
            var message = util.format("[%s] [%s] - %s", srcBucket, srcKey,
                `Successfully processed. Generated ${results.length} images.`);
            callback(null, message);
        })
        .catch((error) => {
            callback(error);
        });
};
