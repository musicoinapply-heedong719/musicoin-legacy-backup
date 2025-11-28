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
 * @file Admin.js
 * @copyright SKALE Labs 2021-Present
*/

import Web3 from 'web3';
import React from 'react';
import { Link } from "react-router-dom";
import { MainnetChain, SChain } from '@skalenetwork/ima-js';

import ERC20Dashboard from '../dashboard/ERC20Dashboard';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';

import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import CallMadeIcon from '@material-ui/icons/CallMade';
import CircularProgress from '@material-ui/core/CircularProgress';

import SkBtn from '../SkBtn';
import SkBtnFilled from '../SkBtnFilled';

import TextField from '@material-ui/core/TextField'

import proxyMainnet from '../../abis/proxyMainnet.json';
import proxySchain from '../../abis/proxySchain.json';

import { getSchainEndpoint, changeMetamaskNetwork, mainnetNetworkParams, schainNetworkParams, getSchainName } from '../../networks';
import { formatWeiBalance } from '../../web3Helper';

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';


class Admin extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        loading: true,
        chain: '',
        chainChanged: false,
        erc20OnMainnet: '',
        erc20OnSchain: ''
    };
    this.loader=this.loader.bind(this);
    this.linkToken=this.linkToken.bind(this);
    this.handleErc20OnMainnetChange=this.handleErc20OnMainnetChange.bind(this);
    this.handleErc20OnSchainChange=this.handleErc20OnSchainChange.bind(this);
  }

  componentDidMount() {
    var intervalId = setInterval(this.loader, 5000);
    this.setState({intervalId: intervalId});
  }
 
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

  async loader() {
    if (!this.props.mainnetWeb3) return;
    this.setState({mainnetChain: new MainnetChain(this.props.mainnetWeb3, proxyMainnet)}); // todo: handle network change

    if (this.props.currentSchain && (this.state.chain !== this.props.currentSchain || !this.state.sChain)) {
      let sChainEndpoint = getSchainEndpoint(this.props.currentSchain);
      let sChainWeb3 = new Web3(sChainEndpoint);
      this.setState({sChain: new SChain(sChainWeb3, proxySchain)});
    }
    if (!this.state.sChain) return;

    this.setState({
      loading: false,
      chainChanged: false,
      chain: this.props.currentSchain,
      account: this.props.currentAccount
    });
  }

  async linkToken() {
    const opts = {
      address: this.state.account
    }

    let schainName = getSchainName(this.props.currentSchain);

    let res = await changeMetamaskNetwork(mainnetNetworkParams());
    let web3 = res[1];
    this.setState({mainnetChain: new MainnetChain(web3, proxyMainnet)});

    const isERC20AddedMainnet = await this.state.mainnetChain.isERC20Added(schainName, this.state.erc20OnMainnet);

    console.log('isERC20AddedMainnet');
    console.log(isERC20AddedMainnet);
    if (!isERC20AddedMainnet){
        await this.state.mainnetChain.addERC20TokenByOwner(schainName, this.state.erc20OnMainnet, opts);
    }

    let schainRes = await changeMetamaskNetwork(schainNetworkParams());
    let schainWeb3 = schainRes[1];
    this.setState({sChain: new SChain(schainWeb3, proxySchain)});

    const isERC20AddedSchain = await this.state.sChain.isERC20Added(this.state.erc20OnMainnet);
    console.log('isERC20AddedSchain');
    console.log(isERC20AddedSchain);
    if (isERC20AddedSchain === ZERO_ADDRESS) {
        await this.state.sChain.addERC20TokenByOwner(this.state.erc20OnMainnet, this.state.erc20OnSchain, opts);
    }
  }

  handleErc20OnMainnetChange(e) {
    this.setState({erc20OnMainnet: e.target.value});
  }

  handleErc20OnSchainChange(e) {
    this.setState({erc20OnSchain: e.target.value});
  }

  render() {
    const { loading } = this.state;

    if (loading || this.state.chain !== this.props.currentSchain ||  this.state.account !== this.props.currentAccount) {
      return (
        <div className="fullscreen-msg">
          <div>
            <div className="flex-container">
              <div className="flex-container fl-centered">
                <CircularProgress className='fullscreen-spin' />
              </div>  
              <div className="flex-container fl-centered">
                <h3 className='fullscreen-msg-text'>
                  Loading {this.props.currentSchain} 
                </h3>
              </div>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="IMAUI">
        <Box component="span" m={1} >
          <Container maxWidth="md">
            <h2 className='card-header'>
              Link token
            </h2>
            <Typography color="textSecondary">
              to {this.props.currentSchain}
            </Typography>
            <form noValidate autoComplete="off" className="marg-top-30">
                <TextField id="outlined-basic" label="erc20OnMainnet" variant="outlined" className='wide' value={this.state.erc20OnMainnet} onChange={this.handleErc20OnMainnetChange} />
                <TextField id="outlined-basic" label="erc20OnSchain" variant="outlined" className='wide marg-top-20 marg-bott-20' value={this.state.erc20OnSchain} onChange={this.handleErc20OnSchainChange}/>
                <SkBtnFilled size="large" className='marg-top-20' variant="contained" color="primary" onClick={this.linkToken}>
                  Link token
                </SkBtnFilled>
            </form>
          </Container>
        </Box>
      </div>
    );
  }
}

export default Admin;
