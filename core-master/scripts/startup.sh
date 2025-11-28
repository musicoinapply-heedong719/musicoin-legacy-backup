sudo su coiner

#!/bin/bash
cd ~
nohup /home/coiner/musicoin/geth --identity 55313717 --datadir chain --rpc --rpcapi=eth,net,web3,personal --rpcport 8545 --rpcaddr 127.0.1 --rpccorsdomain localhost >> geth.log 2>&1 &

./musicoin/geth attach ipc://home/coiner/chain/geth.ipc
admin.addPeer("enode://ba2f6409f9894c12f5aad3471b9c4a2e7999b246af775c39f99d85b020cfc95d0b0dc6dd0985895bb2c4149cb45e4a3c17f7585be326cec293176bf81802a987@104.196.160.105:30303")