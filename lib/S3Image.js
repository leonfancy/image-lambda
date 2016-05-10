'use strict'

class S3Image {
    constructor(bucket, key, data, contentType) {
        this.key = key;
        this.bucket = bucket;
        this.data = ( Buffer.isBuffer(data) ) ? data : new Buffer(data, "binary");
        this.contentType = contentType;
    }

    getKey() {
        return this.key;
    }

    getBucket() {
        return this.bucket;
    }

    getData() {
        return this.data;
    }

    setData(buffer) {
        this.data = buffer
    }

    getContentType() {
        return this.contentType;
    }
}

module.exports = S3Image;
