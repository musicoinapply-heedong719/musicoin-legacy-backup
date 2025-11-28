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
 * @file DepositERC20.js
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
import { changeMetamaskNetwork, mainnetNetworkParams, getSchainName } from '../networks';

import { withRouter } from "react-router";

import tokensMeta from '../meta/tokens.json';
import erc20Abi from '../meta/defaultAbis/erc20.json';


class DepositERC20 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        amount: '',
        address: '',
        wait: false,
        redirect: false
    };
    this.deposit=this.deposit.bind(this);
    this.handleAmountChange=this.handleAmountChange.bind(this);
  }

  async deposit() {
    this.setState({wait: true});

    let token = this.state.tokenSymbol;
    let address = this.state.account;
    let schainName = getSchainName(this.props.currentSchain);

    let amountWei = this.state.mainnetChain.web3.utils.toWei(this.state.amount);
    let opts = {
        address: address
    };
    
    const balanceSchain = await this.state.sChain.getERC20Balance(token, address);
    await this.state.mainnetChain.approveERC20Transfers(token, amountWei, opts);
    await this.state.mainnetChain.depositERC20(schainName, token, amountWei, opts);
    await this.state.sChain.waitERC20BalanceChange(token, address, balanceSchain);
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

    let mainnetChain = new MainnetChain(web3, proxyMainnet);

    const tokenSymbol = this.props.match.params.tokenSymbol;
    let erc20OnMainnet = tokensMeta.erc20[tokenSymbol].address;
    let erc20Contract = new mainnetChain.web3.eth.Contract(erc20Abi.abi, erc20OnMainnet);
    mainnetChain.addERC20Token(tokenSymbol, erc20Contract);

    let erc20OnSchain = await this.state.sChain.isERC20Added(erc20OnMainnet);
    let erc20SchainContract = new this.state.sChain.web3.eth.Contract(erc20Abi.abi, erc20OnSchain);
    this.state.sChain.addERC20Token(tokenSymbol, erc20SchainContract);

    this.setState({
      mainnetChain: mainnetChain,
      address: this.props.currentAccount,
      loading: false,
      chain: this.props.currentSchain,
      account: this.props.currentAccount,
      tokenSymbol: tokenSymbol
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
                    Depositing {this.state.amount} {this.state.tokenSymbol} (ERC20) to {this.props.currentSchain}
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
                Deposit {this.state.tokenSymbol} (ERC20)
              </h2>
              <Typography color="textSecondary">
                to {this.props.currentSchain}
              </Typography>
              <form noValidate autoComplete="off" className="marg-top-30">
                  <TextField id="outlined-basic" label="Amount" variant="outlined" className='wide marg-top-20 marg-bott-20' value={this.state.amount} onChange={this.handleAmountChange}/>
                  <SkBtnFilled size="large" className='marg-top-20' variant="contained" color="primary" onClick={this.deposit}>
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

export default withRouter(DepositERC20);