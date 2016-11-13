#!/bin/sh
vagrant up
vagrant ssh -c "cd image_lambda; npm run build"
vagrant halt