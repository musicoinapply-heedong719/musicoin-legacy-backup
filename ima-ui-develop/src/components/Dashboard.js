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
import { Link } from "react-router-dom";
import { MainnetChain, SChain } from '@skalenetwork/ima-js';

import ERC20Dashboard from './dashboard/ERC20Dashboard';
import ERC721Dashboard from './dashboard/ERC721Dashboard';
import ERC1155Dashboard from './dashboard/ERC1155Dashboard';

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

import SkBtn from './SkBtn';

import proxyMainnet from '../abis/proxyMainnet.json';
import proxySchain from '../abis/proxySchain.json';

import { getSchainEndpoint, getSchainName } from '../networks';
import { formatWeiBalance } from '../web3Helper';

import ethLogo from '../meta/logos/eth.png';


class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        loading: true,
        chain: '',
        chainChanged: false,
        disableWithdrawETH: true,
        disableUnlock: true
    };
    this.balanceChecker=this.balanceChecker.bind(this);
  }

  componentDidMount() {
    var intervalId = setInterval(this.balanceChecker, 5000);
    this.setState({intervalId: intervalId});
  }
 
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }

 async balanceChecker() {
    if (!this.props.mainnetWeb3) return;
    this.setState({mainnetChain: new MainnetChain(this.props.mainnetWeb3, proxyMainnet)}); // todo: handle network change

    if (this.props.currentSchain && (this.state.chain !== this.props.currentSchain || !this.state.sChain)) {
      let sChainEndpoint = getSchainEndpoint(this.props.currentSchain);
      let sChainWeb3 = new Web3(sChainEndpoint);
      this.setState({sChain: new SChain(sChainWeb3, proxySchain)});
    }
    if (!this.state.sChain) return; 

    let mainnetBalance = await this.state.mainnetChain.ethBalance(this.props.currentAccount);
    let schainBalance = await this.state.sChain.ethBalance(this.props.currentAccount);
    let lockedAmount = await this.state.mainnetChain.lockedETHAmount(this.props.currentAccount);

    let schainName = getSchainName(this.props.currentSchain);

    let reimbursementWalletBalance = await this.state.mainnetChain.reimbursementWalletBalance(
      this.props.currentAccount, schainName);
    
    let disableWithdrawETH = reimbursementWalletBalance == 0;

    let disableUnlock = disableWithdrawETH || lockedAmount == 0;
    this.setState({
      loading: false,
      chainChanged: false,
      chain: this.props.currentSchain,
      lockedAmount: lockedAmount,
      mainnetBalance: mainnetBalance,
      sChainBalance: schainBalance,
      reimbursementWalletBalance: reimbursementWalletBalance,
      disableWithdrawETH: disableWithdrawETH,
      account: this.props.currentAccount,
      disableUnlock: disableUnlock
    });
  }

  render() {
    const { loading } = this.state;

    if (!this.props.currentSchain || !this.props.mainnetWeb3) {
      return (
            <div className="fullscreen-msg">
              <div>
                <div className="flex-container">
                  <div className="flex-container fl-centered">
                    <h3 className='fullscreen-msg-text'>
                      {this.props.mainnetWeb3 ? 'Select an sChain in the top right corner' : 'Connect to the Ethereum network to continue'}
                    </h3>
                  </div>
                  <div className="flex-container fl-centered">
                    <CallMadeIcon/>
                  </div>  
                </div>
              </div>
            </div>
      );
    };

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
              <div className="marg-top-20 marg-bott-40">
                <h1 className='card-header'>
                  Dashboard
                </h1>
                <Typography color="textSecondary">
                  sChain {this.props.currentSchain}
                </Typography>
              </div>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableBody>
                      <TableRow key='eth'>
                        <TableCell component="th" scope="row" className='table-left-padd'>
                          <div className="flex-container">
                            <div className="flex-container fl-centered">
                              <AccountBalanceWalletIcon/>
                            </div>
                            <p className="coin-name flex-container">
                              IMA ETH
                            </p>
                          </div>
                        </TableCell>
                        <TableCell align="left">{formatWeiBalance(this.state.reimbursementWalletBalance)}</TableCell>
                        <TableCell align="right">
                          <div className="flex-container fl-right">
                              <div className="fl-centered">
                                <Link className='table-btn' to="/reimbursement/recharge">
                                  <SkBtn color="primary" >Recharge</SkBtn>
                                </Link>
                              </div>
                              <div className="fl-centered">
                                <Link className='table-btn' to={this.state.disableWithdrawETH ? '#' : '/reimbursement/withdraw'}>
                                  <SkBtn color="primary" disabled={this.state.disableWithdrawETH}>Withdraw</SkBtn>
                                </Link>
                              </div>
                              <div className="fl-centered marg-ri-20">
                                <Tooltip title="To withdraw funds from the chain you'll need some amount of ETH locked on the Mainnet">  
                                    <HelpOutlineIcon className='active-help-icon'/>
                                </Tooltip>
                              </div>
                            </div>
                          </TableCell>
                          
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
          </Container>
        </Box>
        <Box component="span" m={1} >
          <Container maxWidth="md"  className='marg-top-20 marg-bott-40'>
              <TableContainer component={Paper}>
                <Table aria-label="simple table">
                  <TableHead>
                    <TableRow>
                      <TableCell className='table-left-padd'>Asset</TableCell>
                      <TableCell align="right">Mainnet balance</TableCell>
                      <TableCell align="right">sChain balance</TableCell>
                      <TableCell align="right">Locked Mainnet balance</TableCell>
                      <TableCell align="right"></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                      <TableRow key='eth'>
                        <TableCell component="th" scope="row" className='table-left-padd'>
                          <div className="flex-container">
                            <div className="flex-container fl-centered">
                              <img src={ethLogo} className="coin-logo" alt="logo" />
                            </div>
                            <p className="coin-name flex-container">
                              ETH
                            </p>
                          </div>
                        </TableCell>
                        <TableCell align="right">{formatWeiBalance(this.state.mainnetBalance)}</TableCell>
                        <TableCell align="right">{formatWeiBalance(this.state.sChainBalance)}</TableCell>
                        <TableCell align="right">{formatWeiBalance(this.state.lockedAmount)}</TableCell>
                        <TableCell align="right">
                          <Link className='table-btn' to="/eth/deposit">
                            <SkBtn color="primary" >Deposit</SkBtn>
                          </Link>
                          <Link className='table-btn' to={this.state.disableWithdrawETH ? '#' : '/eth/withdraw'}>
                            <SkBtn color="primary" disabled={this.state.disableWithdrawETH} >Withdraw</SkBtn>
                          </Link>
                          <Link className='table-btn' to={this.state.disableUnlock ? '#' : '/eth/unlock'}>
                            <SkBtn color="primary" disabled={this.state.disableUnlock}>Unlock</SkBtn>
                          </Link>
                          </TableCell>
                      </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
          </Container>
        </Box>
        <ERC20Dashboard mainnetWeb3={this.props.mainnetWeb3} currentSchain={this.props.currentSchain} currentAccount={this.props.currentAccount}/>
        <ERC721Dashboard/>
        <ERC1155Dashboard/>
      </div>
    );
  }
}

export default Dashboard;
