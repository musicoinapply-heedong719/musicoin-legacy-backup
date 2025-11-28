# This is the dependency module for newsletter system in backend's admin panel


## RabbitMQ

First, if you don't have a RabbitMQ service, you need to deploy a RabbitMQ service.

You can install it with apt-get (Ubuntu) or install it with docker (development)

```
Excample
sudo docker pull rabbitmq
sudo docker run -d -e RABBITMQ_NODENAME=musicoin-rabbit --name musicoin-rabbit -p 5672:5672 rabbitmq
```

## Change .env
Then you need to set the environment variables for sendgrid service or your MQ service

copy .env.default to .env and replace environment variables with yours.

## Run the consumer server
Then you can Run the consumer server, so than the newsletter system can use it.

npm start
