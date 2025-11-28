#! /bin/bash

# restart the container

NAME=$1

cd `dirname $0`
if docker ps -a | grep -i $NAME; then
  ./start-ref-services.sh    
  docker restart $NAME
  docker logs -f $NAME
else
  ./build.sh $NAME
fi

