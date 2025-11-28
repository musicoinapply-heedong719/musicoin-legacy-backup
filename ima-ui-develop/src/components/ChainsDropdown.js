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
 * @file ChainsDropdown.js
 * @copyright SKALE Labs 2021-Present
*/

import React from 'react';

import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CircularProgress from '@material-ui/core/CircularProgress';

import DnsIcon from '@material-ui/icons/Dns';

import { styled } from '@material-ui/core/styles';


const HeaderButton = styled(Button)({
  'color': 'rgb(217, 224, 33)',
});


export default function LongMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (event, index) => {
    props.setCurrentSchain(index);
    setAnchorEl(null);
  };

  if (!props.mainnetWeb3) return null
  

  if (!props.schains) {
    return (
      <div>
        <div className="flex-container marg-left-10">
          <div className="flex-container fl-centered">
            <CircularProgress className='header-spin'/>
          </div>
          <p className="flex-container header-spin-text">
            Loading sChains
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='marg-left-10'>
      <HeaderButton
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        color="primary"
        onClick={handleClick}
        startIcon={<DnsIcon/>}
      > 
        {props.currentSchain ? props.currentSchain : 'Select sChain'}
      </HeaderButton>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={open}
        onClose={handleClose}
      >
        {props.schains.map((option) => (
          <MenuItem 
            onClick={(event) => handleMenuItemClick(event, option)}
            key={option} selected={option === props.currentSchain}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
