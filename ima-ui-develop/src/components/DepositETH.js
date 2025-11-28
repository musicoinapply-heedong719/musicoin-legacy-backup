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
 * @file DepositETH.js
 * @copyright SKALE Labs 2021-Present
*/

import Web3 from 'web3';
import React from 'react';

import { Redirect } from "react-router-dom";

import Container from '@material-ui/core/Container';

import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Typography from '@material-ui/core/Typography';
import SkBtnFilled from './SkBtnFilled';

import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';

import { MainnetChain, SChain } from '@skalenetwork/ima-js';

import proxyMainnet from '../abis/proxyMainnet.json';
import proxySchain from '../abis/proxySchain.json';

import { getSchainEndpoint } from '../networks';
import { changeMetamaskNetwork, mainnetNetworkParams } from '../networks';


class DepositETH extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        amount: '',
        receiver: '',
        address: '',
        wait: false,
        redirect: false
    };
    this.depositETH=this.depositETH.bind(this);
    this.handleAmountChange=this.handleAmountChange.bind(this);
  }

  async depositETH() {
    this.setState({wait: true});

    let amountWei = this.state.mainnetChain.web3.utils.toWei(this.state.amount);
    let txOpts = {
        value: amountWei,
        address: this.state.address
    };
    let sChainBalanceBefore = await this.state.sChain.ethBalance(this.state.address);
    await this.state.mainnetChain.depositETHtoSChain(
        "Bob",
        txOpts
    );
    await this.state.sChain.waitETHBalanceChange(this.state.address, sChainBalanceBefore);
    this.setState({redirect: true});
  }

  handleAmountChange(e) {
      this.setState({amount: e.target.value});
  }

  async componentDidMount () {
    let res = await changeMetamaskNetwork(mainnetNetworkParams());
    let web3 = res[1];

    if (this.props.currentSchain && (this.state.chain !== this.props.currentSchain || !this.state.sChain)) {
      let sChainEndpoint = getSchainEndpoint(this.props.currentSchain);
      let sChainWeb3 = new Web3(sChainEndpoint);
      this.setState({sChain: new SChain(sChainWeb3, proxySchain)});
    }
    if (!this.state.sChain) return; 

    this.setState({
      mainnetChain: new MainnetChain(web3, proxyMainnet),
      address: this.props.currentAccount,
      receiver: this.props.currentAccount,
      loading: false,
      chain: this.props.currentSchain,
      account: this.props.currentAccount
    }); // todo: handle network change
  }

  render() {
    const { redirect, wait } = this.state;

    if (redirect || !this.props.currentSchain) {
      return <Redirect to='/'/>;
    }

    if (wait) {
        return (
          <div className="fullscreen-msg">
              <div className="flex-container">
                <div className="flex-container fl-centered">
                  <CircularProgress className='fullscreen-spin' />
                </div>  
                <div className="flex-container fl-centered">
                  <h3 className='fullscreen-msg-text'>
                    Depositing ETH to {this.props.currentSchain}
                  </h3>
                </div>
              </div>
          </div>
        );
    }

    return (
      <div className="fullscreen-msg">
          <Container maxWidth="sm">
          <Card>
            <CardContent>
              <h2 className='card-header'>
                Deposit ETH
              </h2>
              <Typography color="textSecondary">
                to {this.props.currentSchain}
              </Typography>
              <form noValidate autoComplete="off" className="marg-top-30">
                  <TextField id="outlined-basic" label="Amount" variant="outlined" className='wide marg-top-20 marg-bott-20' value={this.state.amount} onChange={this.handleAmountChange}/>
                  <SkBtnFilled size="large" className='marg-top-20' variant="contained" color="primary" onClick={this.depositETH}>
                    Deposit
                  </SkBtnFilled>
              </form>
            </CardContent>
          </Card>
          </Container>
      </div>
    );
  }
}

export default DepositETH;
