'use strict'
const mkdirp = require('mkdirp');
const path = require("path");
const fs = require("fs");

function saveOutImageFile(reducedImage) {
    var outFile = path.resolve(__dirname, "out/" + reducedImage.getKey());
    mkdirp(path.dirname(outFile), function () {
        fs.writeFileSync(outFile, reducedImage.getData());
    });
}

module.exports = {
    saveOutImageFile: saveOutImageFile
};
