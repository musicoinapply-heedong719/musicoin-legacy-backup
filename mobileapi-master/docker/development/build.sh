#! /bin/bash

# build the project image
# if the image exists, remove them and rebuild
# if reference services isnt running, restart them
# recreate container and start it finaly

NAME=$1

IMAGE_NAME="$NAME:dev"

Dockerfile=$1
# into file dir
cd `dirname $0`

if [ ! -n "$DOCKERFILE" ]; then
Dockerfile=$(pwd)/Dockerfile
fi
echo Dockerfile=$Dockerfile

# remove container
if docker ps -a | grep -i $NAME; then    
  docker container rm -f $NAME
fi

# remove image
if docker image ls | grep -i $IMAGE_NAME; then
  docker image rm -f $IMAGE_NAME
fi

echo "--------->build musicoin-api image..." 
docker build -t $IMAGE_NAME . -f $Dockerfile
echo "--------->build musicoin-api image complete" 

# start reference services
./start-ref-services.sh

echo "create and start musicoin-api container..."

app_dir=$(cd ../../;pwd)
echo "app-dir=$app_dir"
docker run -d --name $NAME --link mongo-node --link gmc-node --link ipfs-node -v $app_dir:/app -p 8082:8082 $IMAGE_NAME
docker logs -f $NAME