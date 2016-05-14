'use strict'
let ImageProcessor = require("../lib/ImageProcessor");
let S3Image = require("../lib/S3Image");
let expect = require("chai").expect;
let gm = require('gm').subClass({imageMagick: true});

let fs = require("fs");
let path = require("path");

describe("ImageProcessor#resize()", function () {
    this.timeout(10000);
    let config;

    beforeEach(function () {
        config = {
            "resizes": [
                {
                    "width": 200,
                    "sourceDir": "images/uploads",
                    "targetBucket": "target-bucket",
                    "targetDir": "images/200w",
                    "ACL": "public-read"
                }
            ]
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
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/jpeg");
                    expect(reducedImage.getKey()).to.equal("images/200w/test.jpg");
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    gm(reducedImage.getData()).size(function (error, size) {
                        expect(size.width).to.equal(config.resizes[0].width);
                        done();
                    });
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });

    describe("png images:", function () {
        let files = ["backpack-2800x2800-8.8MB.png", "imac-800x450-255KB.png", "keyboard-1976x1692-2.1MB.png"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, "fixture/png/" + file), {encoding: "binary"});
                let image = new S3Image("test-bucket", "images/uploads/test.png", data, {ContentType: "image/png"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let reducedImage = results[0];
                    expect(reducedImage.getS3Params().ACL).to.equal("public-read");
                    expect(reducedImage.getS3Params().ContentType).to.equal("image/png");
                    expect(reducedImage.getKey()).to.equal("images/200w/test.png");
                    expect(reducedImage.getBucket()).to.equal("target-bucket");
                    gm(reducedImage.getData()).size(function (error, size) {
                        expect(size.width).to.equal(config.resizes[0].width);
                        done();
                    });
                }).catch(function (error) {
                    console.error(error);
                });
            });
        }
    });

    it("should resize image based on height", function (done) {
        delete config.resizes[0].width;
        config.resizes[0].height = 300;
        let data = fs.readFileSync(path.resolve(__dirname, "fixture/jpg/girl-2560x1600-1.3MB.jpg"), {encoding: "binary"});
        let image = new S3Image("test-bucket", "images/uploads/test.jpg", data, {ContentType: "image/jpeg"});
        let processor = new ImageProcessor(image, config);
        processor.run().then(function (results) {
            let reducedImage = results[0];
            return Promise.all([getImageSize(image.getData()), getImageSize(reducedImage.getData())]).then(function (results) {
                let originSize = results[0];
                let reducedSize = results[1];
                expect(reducedSize.height).to.equal(300);
                expect(reducedSize.height/reducedSize.width).to.equal(originSize.height/originSize.width);
                done();
            });
        }).catch(function (error) {
            console.error(error);
        });
    });

    function getImageSize(imageData) {
        return new Promise(function (resolve, reject) {
            gm(imageData).size({bufferStream: true}, function (error, size) {
                if (error) {
                    reject(error);
                } else {
                    resolve(size);
                }
            });
        })
    }
});
