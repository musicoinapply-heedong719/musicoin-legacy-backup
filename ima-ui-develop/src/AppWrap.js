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
 * @file AppWrap.js
 * @copyright SKALE Labs 2021-Present
*/

import './App.css';

import Web3 from 'web3';

import Header from './components/Header';

import Admin from './components/admin/Admin';
import Dashboard from './components/Dashboard';
import DepositETH from './components/DepositETH';
import WithdrawETH from './components/WithdrawETH';
import UnlockETH from './components/UnlockETH';

import DepositERC20 from './components/DepositERC20';
import WithdrawERC20 from './components/WithdrawERC20';

import Recharge from './components/reimbursement/Recharge';
import Withdraw from './components/reimbursement/Withdraw';

import {CUSTOM_SCHAIN_NAME} from './networks';

import {
  BrowserRouter as Router,
  Switch,
  Route
} from "react-router-dom";

import React, { useState, useEffect } from 'react';


function AppWrap() {
  const [endpoint, setEndpoint] = React.useState(localStorage.getItem('skMainnetEndpoint') || '');
  const [mainnetWeb3, setMainnetWeb3] = useState(undefined);
  const [currentSchain, setCurrentSchain] = useState(CUSTOM_SCHAIN_NAME);
  const [currentAccount, setCurrentAccount] = useState(undefined);


  useEffect(() => {
    async function getMainnetWeb3() {
        setMainnetWeb3(undefined);
        let web3 = new Web3(endpoint);
        try {
          await web3.eth.getBlockNumber();
          setMainnetWeb3(web3);
        } catch (error) {
          console.log(error);
        }
    }
    getMainnetWeb3();
  }, [endpoint]);

  return (
    <div className="AppWrap">
      <Router>
        <Header
          endpoint={endpoint}
          setEndpoint={setEndpoint}
          mainnetWeb3={mainnetWeb3}
          currentSchain={currentSchain}
          setCurrentSchain={setCurrentSchain}

          currentAccount={currentAccount}
          setCurrentAccount={setCurrentAccount}
        />
      <div className='mainApp'>
        <Switch>
          <Route path="/eth/deposit">
            <DepositETH mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>
          <Route path="/eth/withdraw">
            <WithdrawETH mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>
          <Route path="/eth/unlock">
            <UnlockETH mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>

          <Route path="/reimbursement/recharge">
            <Recharge mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>

          <Route path="/reimbursement/withdraw">
            <Withdraw mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>


          <Route path="/admin">
            <Admin mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>

          <Route
            path="/deposit-erc20/:tokenSymbol"
            children={<DepositERC20 mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>}
          />

          <Route
            path="/withdraw-erc20/:tokenSymbol"
            children={<WithdrawERC20 mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>}
          />

          <Route path="/">
            <Dashboard mainnetWeb3={mainnetWeb3} currentSchain={currentSchain} currentAccount={currentAccount}/>
          </Route>
        </Switch>
      </div>
    </Router>
    </div>
  );
}

export default AppWrap;
