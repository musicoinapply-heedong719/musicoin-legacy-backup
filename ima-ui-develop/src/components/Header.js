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
 * @file Header.js
 * @copyright SKALE Labs 2021-Present
*/

import { styled } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import { Link } from "react-router-dom";
import React from 'react';

import { initSkale } from '../networks';
import ChainsDropdown from './ChainsDropdown';
import MainnetWeb3Connector from './MainnetWeb3Connector';
import logo from '../meta/logos/skale-logo.svg';


const tmpChains = ['thundering-saiph', 'handsome-zuben-elakrab', 'glamorous-capella', 'faint-alrai', 'rapping-phaet', 'magnificent-sabik', 'noisy-sterope', 'beautiful-rasalgethi', 'wailing-gorgonea-tertia', 'whispering-alniyat', 'melodic-murzim', 'elegant-ancha', 'stocky-kuma', 'glamorous-syrma', 'melodic-antares', 'faint-mirphak', 'rhythmic-sirius', 'faint-acubens', 'plain-dsiban', 'melodic-achird']

const SkAppBar = styled(AppBar)({
    'background-color': 'rgb(22, 23, 29)',
    padding: '15px 0',
});

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.sChainsChecker=this.sChainsChecker.bind(this);
    this.state = {
      loading: true
    }
  }

  componentDidMount() {
    var intervalId = setInterval(this.sChainsChecker, 5000);
    this.setState({intervalId: intervalId});
  }
 
  componentWillUnmount() {
    clearInterval(this.state.intervalId);
  }
 
 async sChainsChecker() {
    if (!this.props.mainnetWeb3) return;
    if (!this.state.skale) {
      this.setState({skale: initSkale(this.props.mainnetWeb3)});
    }

    // let chains = await this.state.skale.contracts.schainsInternal.getSchainsNames();
    let chains = tmpChains;
    this.setState({
      'loading': false,
      schains: chains
    });
  }

  render() {
    return (
      <SkAppBar position="fixed" className="sk-header" >
        <Toolbar>
            <div className='grow'>
              <Link to="/">
                <img src={logo} className="logo" alt="logo" />
              </Link>
            </div>
            <MainnetWeb3Connector
              web3={this.props.mainnetWeb3}
              setEndpoint={this.props.setEndpoint} 
              endpoint={this.props.endpoint}

              currentAccount={this.props.currentAccount}
              setCurrentAccount={this.props.setCurrentAccount}

              edge='right'
            />
            <ChainsDropdown edge='right' mainnetWeb3={this.props.mainnetWeb3} schains={this.state.schains} currentSchain={this.props.currentSchain} setCurrentSchain={this.props.setCurrentSchain}/>
        </Toolbar>
    </SkAppBar>
    )
  }
}