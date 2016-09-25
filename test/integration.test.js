'use strict'
const fs = require("fs");
const path = require("path");
const AWS = require('aws-sdk-mock');
const expect = require("chai").expect;

const lambdaHandler = require("../index").handler;

describe("Handle s3 event", function () {
    this.timeout(10000);
    before(function () {
        let configFile = path.join(__dirname, "../config.json");
        if (!fs.existsSync(configFile)) {
            let exampleFile = path.join(__dirname, "../config.json.example");
            fs.writeFileSync(configFile, fs.readFileSync(exampleFile));
        }
    });

    beforeEach(function () {
        AWS.mock("S3", "putObject", function (params, callback) {
            callback(null);
        });
    });

    afterEach(function () {
       AWS.restore('S3');
    });

    it("should process image", function (done) {
        AWS.mock("S3", "getObject", function (params, callback) {
            fs.readFile(path.join(__dirname, "fixture/jpg/girl-2560x1600-1.3MB.jpg"), function (error, content) {
                callback(error, {Body: content, ContentType: "image/jpeg", Metadata: {}});
            });
        });

        let eventFixture = JSON.parse(fs.readFileSync(path.join(__dirname, "/fixture/event.json")));
        lambdaHandler(eventFixture, null, (error, data) => {
            if (error) {
                done(error);
            } else {
                done();
            }
        });
    });

    it("should not process image if image is already processed", function (done) {
        AWS.mock("S3", "getObject", function (params, callback) {
            fs.readFile(path.join(__dirname, "fixture/jpg/girl-2560x1600-1.3MB.jpg"), function (error, content) {
                callback(error, {Body: content, ContentType: "image/jpeg", Metadata: {'image-lambda-processed': 'true'}});
            });
        });

        let eventFixture = JSON.parse(fs.readFileSync(path.join(__dirname, "/fixture/event.json")));
        lambdaHandler(eventFixture, null, (error, data) => {
            if (error) {
                done(error);
            } else {
                expect(data).to.contain('Image is already processed');
                done();
            }
        });
    })
});

