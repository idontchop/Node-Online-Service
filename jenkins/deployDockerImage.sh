docker stop $IMAGE
docker rm $IMAGE
docker run -d --rm --name $IMAGE -p 3001:3001 --net=host node-online-service:latest