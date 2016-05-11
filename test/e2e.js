var fs = require("fs");
var path = require("path");
var sourceFile = path.join(__dirname, "/fixture/event.json");
var event = JSON.parse(fs.readFileSync(sourceFile));
var eventHandler = require("../index").handler;


eventHandler(event, null, function (error, data) {
    if (error) {
        console.error(error);
    } else {
        console.log(data);
    }
});
