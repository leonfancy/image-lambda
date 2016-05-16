# slim-lambda

An AWS Lambda function that AWS S3 can invoke to create thumbnails or reduce file size for png and jpg images.

Features:
- Reduce jpg/png file size.  Image file size is reduced by more than 70%.
- PNG files with 100% support for transparency.
- Resize jpg/png based on configuration.

## Dependencies
- `node`, version: 4.x
- `Vagrant`, Required to build the deployment zip package. If you are already working on Linux system, you don't have to install Vagrant.

## How it works

Once you deployed **slim-lambda** package to AWS Lambda and configured it. When an image is uploaded to AWS S3 bucket, S3 sends an notification to AWS Lambda and invokes the **slim-lambda** function. **slim-lambda** reduce/resize the image based on configuration and then put the processed images to target bucket/directory.

![AWS Lambda](http://docs.aws.amazon.com/lambda/latest/dg/images/push-s3-example-10.png)

**Slim Lambda** use [GraphicsMagick](https://github.com/aheckmann/gm) to resize image, and [imagemin](https://github.com/imagemin/imagemin) to reduce image file size.

## Installation

```
git clone https://github.com/SlimFancy/slim-lambda.git
cd slim-lambda
npm install
```

## Configuration
**slim-lambda** supports configuration for reduce/resize image. There is `config.json.sample` in project root directory as example. You can copy to use it.

```
$ cp config.json.sample config.json
```

Here is an example of configuration:

```
{
  "reduce": {
    "sourceDir": "images/uploads",
    "targetBucket": "example",
    "targetDir": "images/reduce",
    "ACL": "public-read"
  },
  "resizes": [
    {
      "width": 100,
      "sourceDir": "images/uploads",
      "targetBucket": "example",
      "targetDir": "images/100w",
      "ACL": "public-read"
    },
    {
      "width": 200,
      "sourceDir": "images/uploads",
      "targetBucket": "example",
      "targetDir": "images/200w",
      "ACL": "public-read"
    },
    {
      "height": 200,
      "sourceDir": "images/uploads",
      "targetBucket": "example",
      "targetDir": "images/200h",
      "ACL": "public-read"
    }
  ]
}
```
- `reduce`: Define params for reduce image.
- `resizes`: Define different image sizes. This example creates 3 thumbnails with different sizes.
- `sourceDir/targetDir`: For example, the uploaded image S3 key is "images/uploads/test-images/test.jpg", you want to generate a reduced image to directory *images/reduce*,  so you can configure `sourceDir=images/uploads` and `targetDir=images/reduce`. Thus, you will get a reduced image with key "images/reduce/test-images/test.jpg". **slim-lambda** replace the `sourceDir` in image s3 key with the `targetDir`.
- `ACL`: *private | public-read | public-read-write | authenticated-read | aws-exec-read | bucket-owner-read | bucket-owner-full-control*. Controls the permission of generated images.
- `targetBucket`: Specify the bucket where you want to put the generated images.
- `width/height`: It's better to just specify one of them, the other side can be resized based on the ratio.


## Create AWS Lambda deployment package

As AWS Lambda function actually running on Amazon Linux, if you compile node modules on you local machine which is not Linux system, some binaries (such as [imagemin](https://github.com/imagemin/imagemin) used in this project) might not work after you deploy function to AWS Lambda.

In order to solve this problem, [Vagrant](https://www.vagrantup.com/) is used to provision a Linux machine locally, and the Lambda deployment package is built in this vagrant machine.

A npm script is created to provision the Linux machine and create the deployment zip package.

```
$ npm run vagrant:build
```

This command takes a few ten minutes the first time you run it, because it needs to download the Linux image and install node environment in the virtual machine. After this command finished, you can find the zip package in `build/` folder with name `slim-lambda.zip`.

If your local operating system is already Linux (such as Ubuntu, CentOS), you can just run below command to build the package:

```
$ npm run build
```

## Contributing

If you'd like to contribute to the project, feel free to submit a PR.

Run tests:

```
$ npm test
```

`test/fixture` directory contains jpg and png images for testing. After you run tests, the reduced and resized images are stored in `test/out`.

## License

MIT
