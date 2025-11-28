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
 * @file Dashboard.js
 * @copyright SKALE Labs 2021-Present
*/

import Web3 from 'web3';
import React from 'react';

import { MainnetChain, SChain } from '@skalenetwork/ima-js';

import proxyMainnet from '../../abis/proxyMainnet.json';
import proxySchain from '../../abis/proxySchain.json';

import { getSchainEndpoint, getSchainName } from '../../networks';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';


import { Link } from "react-router-dom";

import SkBtn from '../SkBtn';

import { formatWeiBalance } from '../../web3Helper';

import tokensMeta from '../../meta/tokens.json';
import erc20Abi from '../../meta/defaultAbis/erc20.json'

const erc20Tokens = tokensMeta['erc20'];

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

const images = importAll(require.context('../../meta/logos', false, /\.(png|jpe?g|svg)$/));

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export default class ERC20Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      tokensData: [],
      tokensInited: false,
      loading: true
    };
    this.updateTokens=this.updateTokens.bind(this);
    this.initTokens=this.initTokens.bind(this);
    this.loadBalances=this.loadBalances.bind(this);
  }

  componentDidMount() {
    var intervalId = setInterval(this.updateTokens, 7000);
    this.setState({intervalId: intervalId});
  }
 
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  async updateTokens() {
    if (!this.props.mainnetWeb3) return;
    if (!this.state.mainnetChain) {
      this.setState({mainnetChain: new MainnetChain(this.props.mainnetWeb3, proxyMainnet)}); // todo: handle network change
    }

    let initSchainIMA = this.props.currentSchain && (this.state.chain !== this.props.currentSchain || !this.state.sChain);
    if (initSchainIMA) {
      let sChainEndpoint = getSchainEndpoint(this.props.currentSchain);
      let sChainWeb3 = new Web3(sChainEndpoint);
      this.setState({sChain: new SChain(sChainWeb3, proxySchain)});
    }
    if (!this.state.sChain) return;
    if (!this.state.tokensInited || initSchainIMA) {
      await this.initTokens();
    }
    await this.loadBalances();
  }

  async loadBalances() {
    let tokensData = this.state.tokensData;
    for (let idx in tokensData) {
      let tokenInfo = tokensData[idx];
      try {
        tokenInfo['mainnetBalance'] = await this.state.mainnetChain.getERC20Balance(tokenInfo['symbol'], this.props.currentAccount);
        if (tokenInfo.linked){
          tokenInfo['sChainBalance'] = await this.state.sChain.getERC20Balance(tokenInfo['symbol'], this.props.currentAccount);
        }
      } catch (err) {
        console.error(err);
      }
    }
    this.setState({
      tokensData: tokensData,
      loading: false,
      chain: this.props.currentSchain,
      account: this.props.currentAccount
    });
  }

  async initTokens() {
    let tokensData = [];
    let schainName = getSchainName(this.props.currentSchain);

    for (let tokenSymbol in erc20Tokens) {
      const erc20OnMainnet = erc20Tokens[tokenSymbol].address;

      const linkedMainnet = await this.state.mainnetChain.isERC20Added(schainName, erc20OnMainnet);
      const mainnetContract = new this.state.mainnetChain.web3.eth.Contract(erc20Abi.abi, erc20OnMainnet);

      this.state.mainnetChain.addERC20Token(tokenSymbol, mainnetContract);
      
      let erc20OnSchain = await this.state.sChain.isERC20Added(erc20OnMainnet);
      const linkedSchain = (erc20OnSchain !== ZERO_ADDRESS);
      if (linkedSchain){
        let erc20SchainContract = new this.state.sChain.web3.eth.Contract(erc20Abi.abi, erc20OnSchain);
        this.state.sChain.addERC20Token(tokenSymbol, erc20SchainContract);
      }

      let logo;
      if (images[tokenSymbol.toLowerCase() + '.png']) {
        logo = images[tokenSymbol.toLowerCase() + '.png'].default; 
      }

      tokensData.push({
        'symbol': tokenSymbol,
        'name': erc20Tokens[tokenSymbol].name,
        'linked': linkedMainnet && linkedSchain,
        'logo': logo,
        'mainnetBalance': '',
        'sChainBalance': ''
      });
    }

    this.setState({
      tokensInited: true,
      tokensData: tokensData
    });
  }

  render() {
    const { tokensData, loading } = this.state;

    if (loading || this.state.chain !== this.props.currentSchain ||  this.state.account !== this.props.currentAccount) {
      return (
        <Box component="span" m={1}>
          <Container maxWidth="md">
              <h2 className='marg-bott-40'>
                ERC20 Tokens
              </h2>
              <div className="flex-container fl-centered">
                <div className="flex-container fl-centered">
                  <CircularProgress className='fullscreen-spin' />
                </div>  
                <div className="flex-container fl-centered">
                  <h4 className='fullscreen-msg-text'>
                    Loading ERC20 tokens
                  </h4>
                </div>
              </div>
          </Container>
        </Box>
      );
    };

    return (
      <Box component="span" m={1}>
        <Container maxWidth="md">
            <h2 className='marg-bott-40'>
              ERC20 Tokens
            </h2>
            <TableContainer component={Paper} className='marg-bott-40'>
              <Table aria-label="simple table">
              <TableHead>
                  <TableRow>
                    <TableCell className='table-left-padd'>Token</TableCell>
                    <TableCell align="right">Mainnet balance</TableCell>
                    <TableCell align="right">sChain balance</TableCell>
                    <TableCell align="right"></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tokensData.map((row) => (
                    <TableRow key={row.name}>
                      <TableCell component="th" scope="row" className='table-left-padd'>
                        <div className="flex-container">
                            <div className="flex-container fl-centered">
                              <img src={row.logo} className="coin-logo" alt="logo" />
                            </div>
                            <p className="coin-name flex-container">
                              {row.name} ({row.symbol})
                            </p>
                          </div>
                      </TableCell>
                      <TableCell align="right">{formatWeiBalance(row.mainnetBalance)}</TableCell>
                      <TableCell align="right">{formatWeiBalance(row.sChainBalance)}</TableCell>
                      <TableCell align="right">
                        {row.linked ? (
                          <div>
                                <Link className='table-btn' to={'/deposit-erc20/' + row.symbol}>
                            <SkBtn color="primary" >Deposit</SkBtn>
                          </Link>
                          <Link className='table-btn'  to={'/withdraw-erc20/' + row.symbol}>
                            <SkBtn color="primary" disabled={this.state.disableWithdrawETH}>Withdraw</SkBtn>
                          </Link>
                          </div>
                        ) : <SkBtn color="primary" disabled='true'>Token is not linked</SkBtn>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
        </Container>
      </Box>
    );
  }
}
