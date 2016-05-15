'use strict'
let ImageProcessor = require("../lib/ImageProcessor");
let S3Image = require("../lib/S3Image");
let expect = require("chai").expect;
let gm = require('gm').subClass({imageMagick: true});
let helper = require("./helper");

let fs = require("fs");
let path = require("path");

describe("ImageProcessor#resize()", function () {
    this.timeout(10000);
    let config;

    beforeEach(function () {
        config = {
            "resizes": [
                {
                    "width": 400,
                    "sourceDir": "images/uploads",
                    "targetBucket": "target-bucket",
                    "targetDir": "images/400w",
                    "ACL": "public-read"
                }
            ]
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
                    let resizedImage = results[0];
                    expect(resizedImage.getS3Params().ACL).to.equal("public-read");
                    expect(resizedImage.getS3Params().ContentType).to.equal("image/jpeg");
                    expect(resizedImage.getKey()).to.equal("images/400w/" + file);
                    expect(resizedImage.getBucket()).to.equal("target-bucket");
                    helper.saveOutImageFile(resizedImage);
                    gm(resizedImage.getData()).size(function (error, size) {
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
        let files = ["fixture/png/backpack-2800x2800-8.8MB.png",
            "fixture/png/imac-800x450-255KB.png",
            "fixture/png/keyboard-1976x1692-2.1MB.png"];

        for (let file of files) {
            it(file, function (done) {
                let data = fs.readFileSync(path.resolve(__dirname, file));
                let image = new S3Image("test-bucket", "images/uploads/" + file, data, {ContentType: "image/png"});
                let processor = new ImageProcessor(image, config);
                processor.run().then(function (results) {
                    let resizedImage = results[0];
                    expect(resizedImage.getS3Params().ACL).to.equal("public-read");
                    expect(resizedImage.getS3Params().ContentType).to.equal("image/png");
                    expect(resizedImage.getKey()).to.equal("images/400w/" + file);
                    expect(resizedImage.getBucket()).to.equal("target-bucket");
                    helper.saveOutImageFile(resizedImage);
                    gm(resizedImage.getData()).size(function (error, size) {
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
        config.resizes[0].targetDir = "images/300h";
        var file = "fixture/jpg/girl-2560x1600-1.3MB.jpg";
        let data = fs.readFileSync(path.resolve(__dirname, file));
        let image = new S3Image("test-bucket", "images/uploads/" + file, data, {ContentType: "image/jpeg"});
        let processor = new ImageProcessor(image, config);
        processor.run().then(function (results) {
            let resizedImage = results[0];
            helper.saveOutImageFile(resizedImage);
            return Promise.all([getImageSize(image.getData()), getImageSize(resizedImage.getData())]).then(function (results) {
                let originSize = results[0];
                let resizedSize = results[1];
                expect(resizedSize.height).to.equal(300);
                expect(resizedSize.height/resizedSize.width).to.equal(originSize.height/originSize.width);
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
