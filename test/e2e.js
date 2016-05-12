'use strict'
let fs = require("fs");
let path = require("path");
let sourceFile = path.join(__dirname, "/fixture/event.json");
let event = JSON.parse(fs.readFileSync(sourceFile));
let eventHandler = require("../index").handler;


eventHandler(event, null, (error, data) => {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
});
