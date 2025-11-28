import './App.css';
import {useEffect} from 'react';
import { Metaport } from '@skalenetwork/metaport';

function App() {

  useEffect(()=>{
    const widget = new Metaport({
      open: true, // Open Metaport on load (optional, default = false)
      mainnetEndpoint: 'https://eth-rinkeby.gateway.pokt.network/v1/5f84c75ab90218002e9cea00', // Ethereum Mainnet endpoint, required only for M2S or S2M transfers (optional, default = null)
      network: 'staging', // SKALE network that will be used - mainnet or staging (optional, defualt = mainnet)
      schains: [ // List of SKALE Chains that will be available in the Metaport UI (default = [])
        'mainnet',
        'rapping-zuben-elakrab'
      ],
      schainAliases: { // Chain name aliases that will be displayed in the UI (optional, defualt = {})
        'rapping-zuben-elakrab': 'Musicoin testnet'
      },
      tokens: { // List of tokens that will be available in the Metaport UI (default = {})
        'rapping-zuben-elakrab': { // chain name where token origin deployed (mainnet or SKALE Chain name)
          'erc20': { // token type (erc20 and eth are supported)
            'MUSIC': { // token symbol
              'name': 'Musicoin', // token display name
              'address': '0xcF4Ef8082885176313A2f52062Ac079256BBe6De' // token origin address
            }
          }
        },
        'mainnet': { // chain name where token origin deployed (mainnet or SKALE Chain name)
          'erc20': { // token type (erc20 and eth are supported)
            'MUSIC': { // token symbol
              'name': 'Musicoin', // token display name
              'address': '0xcF4Ef8082885176313A2f52062Ac079256BBe6De' // token origin address
            }
          }
        }
      },
      theme:{ // custom widget theme (default = dark SKALE theme)
        primary: '#00d4ff', // primary accent color for action buttons
        background: '#0a2540', // background color
        mode: 'dark' // theme type - dark or light
      }
    });

  }, []);

  return (
    <div className="App">
    </div>
  );
}

export default App;
