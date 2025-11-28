# IMA UI

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

IMA-UI is a Typescirpt/Javascript sample project which uses [ima-js](https://github.com/skalenetwork/ima-js) under the hood to demonstrate the functionality of SKALE Interchain Messaging Agent (IMA).

> This project is for testing purposes only!

## Usage

You can connect ima-ui to any pair of networks (Mainnet and SKALE chain), it can be ima-sdk or real
networks, like Rinkeby and real SKALE chain.

You can find instructions for running IMA-SDK in [this doc](https://docs.skale.network/develop/ima-sdk).

Required `.env` variables:

```dotenv
REACT_APP_CUSTOM_MAINNET_URL=https://test-sdk.com/mainnet # example
REACT_APP_MAINNET_CHAIN_ID='0x561'

REACT_APP_CUSTOM_SCHAIN_URL=https://test-sdk.com/schain # example
REACT_APP_SCHAIN_CHAIN_ID='0x12345'

REACT_APP_CUSTOM_SCHAIN_NAME='Bob'
```

### ABIs

To run ima-ui you will need IMA ABIs both for Mainnet and sChain sides:

1. Put Mainnet IMA ABI to: `src/abi/proxyMainnet.json`
2. Put sChain IMA ABI to: `src/abi/proxySchain.json`
3. Put Mainnet SKALE Manager ABI to: `src/abi/manager.json` (for test purposes you can use any valid SKALE Manager ABI from any public release)

### Deploy test ERC20 tokens

To test ERC20 transfers you can deploy a few test tokens to the Mainnet & sChain sides using scripts from the repo:

```bash
bash scripts/deploy_test_tokens.sh
```

NOTE: To do this, add the following environment variables to your `.env` file:

```donenv
TEST_PRIVATE_KEY=
TEST_ADDRESS=

MAINNET_ENDPOINT=
SCHAIN_ENDPOINT=
```

After deploying tokens put Mainnet addresses in the `src/meta/tokens.json` in the following format:

```json
{
  "erc20": {
    "TICKER": {
      "name": "Token name",
      "address": "0x..."
    },
    ...
  }
}
```

## Development

```bash
yarn install
yarn start
```

After running the server you should be able to make changes interactively.

The project is based on `react-react-app` and uses `mui` React library for the frontend.

## Contributing

**If you have any questions please ask our development community on [Discord](https://discord.gg/vvUtWJB).**

[![Discord](https://img.shields.io/discord/534485763354787851.svg)](https://discord.gg/vvUtWJB)

## License

![GitHub](https://img.shields.io/github/license/skalenetwork/skale.py.svg)

All contributions are made under the [GNU Affero General Public License v3](https://www.gnu.org/licenses/agpl-3.0.en.html). See [LICENSE](LICENSE).
