#!/bin/sh
if [ ! -d build ]; then
    mkdir build
fi
cp config.json build/
cp index.js build/
cp -R lib build/
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
