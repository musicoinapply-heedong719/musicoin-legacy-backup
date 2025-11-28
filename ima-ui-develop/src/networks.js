/**
 * @license
 * SKALE ima-ui
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

/**
 * @file networks.js
 * @copyright SKALE Labs 2021-Present
*/

import Web3 from 'web3';
import Skale from '@skalenetwork/skale.js-test';

import smAbi from './abis/manager.json';

export const MAINNET_CHAIN_ID = process.env["REACT_APP_MAINNET_CHAIN_ID"];

export const CUSTOM_MAINNET_URL = process.env["REACT_APP_CUSTOM_MAINNET_URL"]; // dev only
export const CUSTOM_SCHAIN_URL = process.env["REACT_APP_CUSTOM_SCHAIN_URL"]; // dev only
export const CUSTOM_SCHAIN_CHAIN_ID = process.env["REACT_APP_SCHAIN_CHAIN_ID"]; // dev only

export const CUSTOM_SM_URL = process.env["REACT_APP_CUSTOM_SM_URL"]; // dev only
export const CUSTOM_SCHAIN_NAME = process.env["REACT_APP_CUSTOM_SCHAIN_NAME"]; // dev only


export function mainnetNetworkParams() {
  if (CUSTOM_MAINNET_URL && CUSTOM_MAINNET_URL.length > 0) {
      return {
          chainId: MAINNET_CHAIN_ID,
          chainName: "IMA Custom | Mainnet",
          rpcUrls: [CUSTOM_MAINNET_URL],
          nativeCurrency: {
              name: "ETH",
              symbol: "ETH",
              decimals: 18
          }
      }
  };
  if (MAINNET_CHAIN_ID  && MAINNET_CHAIN_ID.length > 0) {
    return {
      chainId: MAINNET_CHAIN_ID
    }
  };
}


export function schainNetworkParams(schainName, schainChainUrl, schainChainId) {
  if (CUSTOM_SCHAIN_URL && CUSTOM_SCHAIN_URL.length > 0) {
      return {
          chainId: CUSTOM_SCHAIN_CHAIN_ID,
          chainName: "IMA Custom | sChain",
          rpcUrls: [CUSTOM_SCHAIN_URL],
          nativeCurrency: {
              name: "SKALE ETH",
              symbol: "skETH",
              decimals: 18
          }
      }
  };
  return {
    chainId: schainChainId,
    chainName: "sChain " + schainName,
    rpcUrls: [schainChainUrl],
    nativeCurrency: {
        name: "SKALE ETH",
        symbol: "skETH",
        decimals: 18
    }
  };
}


export async function changeMetamaskNetwork(networkParams) {
    try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{chainId: networkParams.chainId}],
        });
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask.
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [networkParams],
            });
            return [0, new Web3(window.ethereum)];
          } catch (addError) {
            return [1, addError];
          }
        }
        return [1, switchError];
    }
    return [0, new Web3(window.ethereum)];
}


export function initSkale(web3) {
  if (!CUSTOM_SM_URL) return new Skale(web3, smAbi);
  const customWeb3 = new Web3(CUSTOM_SM_URL);
  return new Skale(customWeb3, smAbi);
}

export function getSchainEndpoint(schainName) {
  if (CUSTOM_SCHAIN_URL) return CUSTOM_SCHAIN_URL;
  return schainName; // todo: return skale-proxy URL
}

export function getSchainName(schainName) {
  if (CUSTOM_SCHAIN_NAME) return CUSTOM_SCHAIN_NAME;
  return schainName // todo: return skale-proxy URL
}