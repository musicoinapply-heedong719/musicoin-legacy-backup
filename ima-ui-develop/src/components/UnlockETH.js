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
 * @file UnlockETH.js
 * @copyright SKALE Labs 2021-Present
*/

import React from 'react';
import { Redirect } from "react-router-dom";

import Container from '@material-ui/core/Container';
import CircularProgress from '@material-ui/core/CircularProgress';


import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';

import Typography from '@material-ui/core/Typography';
import SkBtnFilled from './SkBtnFilled';

import { MainnetChain } from '@skalenetwork/ima-js';

import proxyMainnet from '../abis/proxyMainnet.json';
import { changeMetamaskNetwork, mainnetNetworkParams } from '../networks';


class UnlockETH extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      wait: false,
      redirect: false,
      loading: true
    };
    this.unlockETH = this.unlockETH.bind(this);
  }

  async componentDidMount () {
    let res = await changeMetamaskNetwork(mainnetNetworkParams());
    let web3 = res[1];
    this.setState({
      mainnetChain: new MainnetChain(web3, proxyMainnet),
      address: this.props.currentAccount,
      loading: false
    }); // todo: handle network change
  }

  async unlockETH() {
    this.setState({ wait: true });
    await this.state.mainnetChain.getMyEth(
        {
          address: this.state.address
        }
    );
    this.setState({ redirect: true });
  }

  handleReceiverChange(e) {
    this.setState({ receiver: e.target.value });
  }

  handleAmountChange(e) {
    this.setState({ amount: e.target.value });
  }

  render() {
    const { redirect, wait, loading } = this.state;

    if (redirect) {
      return <Redirect to='/' />;
    }


    if (loading) {
      return (
        <div className="fullscreen-msg">
          <div>
            <div className="flex-container">
              <div className="flex-container fl-centered">
                <CircularProgress className='fullscreen-spin' />
              </div>  
              <div className="flex-container fl-centered">
                <h3 className='fullscreen-msg-text'>
                  Loading page
                </h3>
              </div>
            </div>
          </div>
        </div>
      );
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
                  Unlocking ETH on the Mainnet...
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
                Unlock ETH
              </h2>
              <Typography color="textSecondary">
                on Mainnet
              </Typography>
              <form noValidate autoComplete="off" >
                  <SkBtnFilled size="large" className='marg-top-20' variant="contained" color="primary" onClick={this.unlockETH}>
                  Unlock
                  </SkBtnFilled>
              </form>
            </CardContent>
          </Card>
          </Container>
      </div>
    );
  }
}

export default UnlockETH;
