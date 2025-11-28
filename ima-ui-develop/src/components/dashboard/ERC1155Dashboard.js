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
 * @file ERC1155Dashboard.js
 * @copyright SKALE Labs 2021-Present
*/

import React from 'react';

import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';

export default class ERC1155Dashboard extends React.Component {
  render() {
    return (
      <Box component="span" m={1}>
        <Container maxWidth="md">
            <h2 className='marg-bott-40'>
              ERC1155 Tokens
            </h2>
            <Typography color="textSecondary" className='marg-bott-40'>
              ERC1155 tokens will be added soon
            </Typography>
        </Container>
      </Box>
    );
  }
}
