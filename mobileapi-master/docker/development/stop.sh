#! /bin/bash

# stop all services

NAME=$1

docker stop $NAME

cd `dirname $0`
./stop-ref-services.sh