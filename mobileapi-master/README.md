## INSTALL

### 0 install project
`git clone https://github.com/Musicoin/api.git && cd api`

### 1 switch to dev branch
`git checkout -b river/dev --track origin/river/dev`

### 2 install node modules
`npm install`

## Develop with docker

### 0 setup required variable
`cp docker/development/.env.docker .env`

### 1 build docker container
`npm run build:docker` 

### 2 restart if codes changed
`npm run start:docker`

### 3 stop all docker container
`npm run stop:docker`

## Develop without docker

### 0 setup required variable
`cp .env.default .env`

### 1 start reference services

#### start with docker 
`npm run start:refs`

#### start services manually 
1. installl mongodb and start it
2. install gmc and start it
3. install ipfs and start it
4. more detail see REFERENCE

### 3 start api service
`npm start`

API Documentation over at [doc](https://documenter.getpostman.com/view/6054511/Rzn6wiiB)


## REFERENCE

You need to run a gmc / parity node and ipfs on the backend in order to test this effectively

```
screen -S gmc ./go-musicoin/build/bin/gmc --rpc --rpcapi=eth,net,web3,personal --rpcport 8545 --rpcaddr 127.0.0.1 --rpccorsdomain lcoalhost
```

```
screen -S ipfs ./go-ipfs/ipfs daemon --init=true --migrate=true
```

`node app.js --ipfsHost http://localhost:8080 --web3Host http://localhost:8545`

Requires environment variables to be set (refer config.js)


### Test

Checkout test shells in test directory
