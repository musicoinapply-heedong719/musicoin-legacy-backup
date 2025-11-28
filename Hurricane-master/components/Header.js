import StatsQuery from '../graphql/query/StatsQuery';
import PlaysIncreasedSubscription from '../graphql/subscription/PlaysIncreasedSubscription';
import {Query} from 'react-apollo';
import StatsComponent from './Stats';

function Header() {
  return (
      <header id="header">
        <div className="container header__container">
          <div className="header__container-left">
            <a href="/" className="">
              <img src="/img/musicoin-logo.png" className="logo" alt="Musicoin Brand"/>
            </a>
          </div>
          <div className="header__container-middle">
            <Query query={StatsQuery}>
              {({loading, error, data, subscribeToMore}) => {
                if (loading) return <p>Loading...</p>;
                if (error) return <p>Error: {error.message}</p>;
                const more = () => subscribeToMore({
                  document: PlaysIncreasedSubscription,
                  updateQuery: (prev, {subscriptionData}) => {
                    if (!subscriptionData.data.playsIncreased) return prev;
                    let stats = subscriptionData.data.playsIncreased;
                    return Object.assign({}, prev, {
                      stats,
                    });
                  },
                });
                return <StatsComponent stats={data.stats} subscribeToMore={more}/>;
              }}
            </Query>
          </div>
          <div className="header__container-right">
            <ul className="header__menu">
              <li><a href="#" className="btn btn-secondary">login</a></li>
              <li><a href="#" className="btn btn-primary">sign up</a></li>
            </ul>
          </div>
        </div>
      </header>
  );

}

export default Header;