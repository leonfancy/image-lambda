#!/bin/sh
if [ ! -d build ]; then
    mkdir build
fi
cp config.json build/config.json
cp index.js build/index.js
cp -R lib build/lib
cp package.json build/
cd build
npm install --production
echo "Creating zip package..."
zip -rq slim-lambda.zip .
if [ $? -eq 0 ]; then
    echo "Successfully created package: build/slim-lambda.zip"
else
    echo "Build failed"
fi
