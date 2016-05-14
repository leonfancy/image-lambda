#!/bin/sh
if [ ! -d build ] ;then mkdir build; fi
cp config.json build/config.json
cp index.js build/index.js
cp -R lib build/lib
cp -R node_modules build/node_modules
echo "Creating the zip package..."
cd build && zip -rq aws-lambda-image-processing.zip .
if [ $? -eq 0 ]; then
  echo "Successfully created build/aws-lambda-image-processing.zip"
else
  echo "Build failed"
fi

