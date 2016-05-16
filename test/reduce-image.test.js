'use strict'
const ImageProcessor = require("../lib/ImageProcessor");
const S3Image = require("../lib/S3Image");
const expect = require("chai").expect;
const helper = require("./helper");

const fs = require("fs");
const path = require("path");

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
        let files = ["fixture/jpg/girl-2560x1600-1.3MB.jpg",
            "fixture/jpg/ios9-1050x1734-299KB.jpg",
            "fixture/jpg/meeting-5184x3456-7.2MB.jpg"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, file));
                let image = new S3Image("test-bucket", "images/uploads/" + file, data, {ContentType: "image/jpeg"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let reducedImage = results[0];
                    expect(reducedImage.getData().length).to.be.below(data.length);
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/jpeg");
                    expect(reducedImage.getKey()).to.equal("images/reduce/" + file);
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    helper.saveOutImageFile(reducedImage);
                    done();
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });

    describe("png images:", function () {
        let files = ["fixture/png/backpack-2800x2800-8.8MB.png",
            "fixture/png/imac-800x450-255KB.png",
            "fixture/png/flavors-1500x735-2.7MB.png",
            "fixture/png/keyboard-1976x1692-2.1MB.png"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, file));
                let image = new S3Image("test-bucket", "images/uploads/" + file, data, {ContentType: "image/png"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let reducedImage = results[0];
                    expect(reducedImage.getData().length).to.be.below(data.length);
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/png");
                    expect(reducedImage.getKey()).to.equal("images/reduce/" + file);
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    helper.saveOutImageFile(reducedImage);
                    done();
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });
});
