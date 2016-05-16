'use strict'
const fs = require("fs");
const path = require("path");
const AWS = require('aws-sdk-mock');

const lambdaHandler = require("../index").handler;

describe("Handle s3 event", function () {
    this.timeout(10000);
    before(function () {
        let configFile = path.join(__dirname, "../config.json");
        if (!fs.existsSync(configFile)) {
            let exampleFile = path.join(__dirname, "../config.json.example");
            fs.writeFileSync(configFile, fs.readFileSync(exampleFile));
        }

        AWS.mock("S3", "getObject", function (params, callback) {
            fs.readFile(path.join(__dirname, "fixture/jpg/girl-2560x1600-1.3MB.jpg"), function (error, content) {
                callback(error, {Body: content, ContentType: "image/jpeg"});
            });
        });
        AWS.mock("S3", "putObject", function (params, callback) {
            callback(null);
        });
    });

    it("should process image", function (done) {
        let eventFixture = JSON.parse(fs.readFileSync(path.join(__dirname, "/fixture/event.json")));
        lambdaHandler(eventFixture, null, (error, data) => {
            if (error) {
                console.error(error);
            } else {
                done();
            }
        });
    })
});

