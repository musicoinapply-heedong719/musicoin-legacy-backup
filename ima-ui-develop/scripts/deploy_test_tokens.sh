#!/usr/bin/env bash

set -e

export DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

cd $DIR/../test-tokens

if [ $INSTALL_PACKAGES == 'True' ]; then
    yarn install
fi

bash $DIR/deploy_erc20.sh SKALE SKL
bash $DIR/deploy_erc20.sh Tether USDT
bash $DIR/deploy_erc20.sh USDC USDC
bash $DIR/deploy_erc20.sh Maker MKR
