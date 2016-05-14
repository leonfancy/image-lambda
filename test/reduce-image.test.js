'use strict'
let ImageProcessor = require("../lib/ImageProcessor");
let S3Image = require("../lib/S3Image");
let expect = require("chai").expect;

let fs = require("fs");
let path = require("path");

describe("ImageProcessor#reduce()", function () {
    this.timeout(10000);
    let config;

    before(function () {
        config = {
            "reduce": {
                "sourceDir": "images/uploads",
                "targetBucket": "target-bucket",
                "targetDir": "images/reduce",
                "ACL": "public-read"
            },
            "resizes": []
        }
    });

    describe("jpg image:", function () {
        let files = ["girl-2560x1600-1.3MB.jpg", "ios9-1050x1734-299KB.jpg", "meeting-5184x3456-7.2MB.jpg"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, "fixture/jpg/" + file), {encoding: "binary"});
                let image = new S3Image("test-bucket", "images/uploads/test.jpg", data, {ContentType: "image/jpeg"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let reducedImage = results[0];
                    expect(reducedImage.getData().length).to.be.below(data.length);
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/jpeg");
                    expect(reducedImage.getKey()).to.equal("images/reduce/test.jpg");
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    done();
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });

    describe.skip("png images:", function () {
        let files = ["backpack-2800x2800-8.8MB.png", "imac-800x450-255KB.png", "keyboard-1976x1692-2.1MB.png"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, "fixture/png/" + file), {encoding: "binary"});
                let image = new S3Image("test-bucket", "images/uploads/test.png", data, {ContentType: "image/png"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let reducedImage = results[0];
                    expect(reducedImage.getData().length).to.be.below(data.length);
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/png");
                    expect(reducedImage.getKey()).to.equal("images/reduce/test.png");
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    done();
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });
});