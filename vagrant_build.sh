#!/bin/sh
vagrant up
vagrant ssh -c "cd slim_lambda; npm run build"
vagrant halt