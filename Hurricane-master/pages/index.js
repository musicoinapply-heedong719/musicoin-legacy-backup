import {withApollo} from '../apollo/client';

import Layout from '../components/MyLayout';
import MenuCard from '../components/Cards/MenuCard';
import SocialCard from '../components/Cards/SocialCard';
import MobileAppCard from '../components/Cards/MobileAppCard';
import AOWCard from '../components/Cards/AOWCard';
import NewArtistCard from '../components/Cards/NewArtistCard';
import DebutsCard from '../components/Cards/DebutsCard';
import EventsCard from '../components/Cards/EventsCard';
import LocationCard from '../components/Cards/LocationCard';
import TrendingCard from '../components/Cards/TrendingCard';
import TrendingReleasesQuery from '../graphql/query/TrendingReleasesQuery';
import TrendingListUpdatedSubscription from '../graphql/subscription/TrendingListUpdatedSubscription';

import {Query} from 'react-apollo';

function Home() {
  return (
      <Layout>
        <div className="content__container-left">
          <MenuCard/>
          <SocialCard/>
          <MobileAppCard/>
        </div>
        <div className="content__container-middle">
          <Query query={TrendingReleasesQuery} variables={{limit: 20}}>
            {({loading, error, data, subscribeToMore}) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error: {error.message}</p>;
              const more = () => subscribeToMore({
                document: TrendingListUpdatedSubscription,
                updateQuery: (prev, {subscriptionData}) => {
                  if (!subscriptionData.data.trendingListUpdated) return prev;
                  let releases = subscriptionData.data.trendingListUpdated;
                  return Object.assign({}, prev, {
                    trendingList: releases
                  });
                },
              });
              return (
                  <TrendingCard data={data.trendingList} subscribeToMore={more}/>
              );

            }}
          </Query>

          {/*  <div className="card">*/}
          {/*    <div className="card__title">*/}
          {/*      <p>Top Tips</p>*/}
          {/*      <div className="card__filter">*/}
          {/*        <a href="#" className="card__filter-link active">Day |</a>*/}
          {/*        <a href="#" className="card__filter-link">Week |</a>*/}
          {/*        <a href="#" className="card__filter-link">Month </a>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*    <div className="card__content">*/}
          {/*      <div className="top-tips">*/}
          {/*        <div className="track-container">*/}
          {/*          <Track image="/img/tracks/tracks-1.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1200} tips={3400}/>*/}
          {/*          <Track image="/img/tracks/tracks-2.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1234} tips={2345}/>*/}
          {/*          <Track image="/img/tracks/tracks-3.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={3456} tips={4567}/>*/}
          {/*          <div className="card__more">*/}
          {/*            <a href="#" className="card__more-link">See more</a>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <div className="card">*/}
          {/*    <div className="card__title">*/}
          {/*      <p>Top Played</p>*/}
          {/*      <div className="card__filter">*/}
          {/*        <a href="#" className="card__filter-link">Day |</a>*/}
          {/*        <a href="#" className="card__filter-link active">Week |</a>*/}
          {/*        <a href="#" className="card__filter-link">Month </a>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*    <div className="card__content">*/}
          {/*      <div className="top-tips">*/}
          {/*        <div className="track-container">*/}
          {/*          <Track image="/img/tracks/tracks-1.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1200} tips={3400}/>*/}
          {/*          <Track image="/img/tracks/tracks-2.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1234} tips={2345}/>*/}
          {/*          <Track image="/img/tracks/tracks-3.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={3456} tips={4567}/>*/}
          {/*          <div className="card__more">*/}
          {/*            <a href="#" className="card__more-link">See more top tips track</a>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
          {/*  <div className="card">*/}
          {/*    <div className="card__title">*/}
          {/*      <p>New Releases</p>*/}
          {/*    </div>*/}
          {/*    <div className="card__content">*/}
          {/*      <div className="top-tips">*/}
          {/*        <div className="track-container">*/}
          {/*          <Track image="/img/tracks/tracks-1.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1200} tips={3400}/>*/}
          {/*          <Track image="/img/tracks/tracks-2.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={1234} tips={2345}/>*/}
          {/*          <Track image="/img/tracks/tracks-3.png" title="Track's title" artist="Artist's name" genre="Electronic, Alternative" likes={3456} tips={4567}/>*/}
          {/*          <div className="card__more">*/}
          {/*            <a href="#" className="card__more-link">See more top new releases</a>*/}
          {/*          </div>*/}
          {/*        </div>*/}
          {/*      </div>*/}
          {/*    </div>*/}
          {/*  </div>*/}
        </div>
        <div className="content__container-right">
          <AOWCard/>
          <NewArtistCard/>
          <DebutsCard/>
          <EventsCard/>
          <LocationCard/>
        </div>
      </Layout>
  );
}

export default withApollo(Home);