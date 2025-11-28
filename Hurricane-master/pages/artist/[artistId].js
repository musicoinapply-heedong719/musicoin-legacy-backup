import {withApollo} from '../../apollo/client';

import Layout from '../../components/MyLayout';
import GetArtistQuery from '../../graphql/query/GetArtistQuery';

import {withRouter} from 'next/router';

import {Query} from 'react-apollo';
import React from 'react';
import Track from '../../components/Track';

function Artist(props) {
  const {artistId} = props.router.query;

  return (
      <Query query={GetArtistQuery} variables={{id: artistId}}>
        {({loading, error, data}) => {
          if (loading) return <p>Loading...</p>;
          if (error) return <p>Error: {error.message}</p>;
          if (data && data.getArtist) {
            let artist = data.getArtist;

            return (
                <Layout>
                  <div>
                    <p>{artist.name}</p>
                  </div>
                  <div className="content__container-middle">
                    <div className="card">
                      <div className="card__title">
                        <p>Trending</p>
                      </div>
                      <div className="card__content">
                        <div className="top-tips">
                          <div className="track-container">
                            {artist.artistTracks.map(release => (
                                <Track key={release.tx} image="/img/tracks/tracks-1.png" track={release}/>
                            ))}
                            <div className="card__more">
                              <a href="#" className="card__more-link">See more</a>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="content__container-right">
                    <div className="card">
                      <div className="card__title">
                        <p>More info</p>
                      </div>
                      <div className="card__content">
                        <p>Followers: {artist.followers}</p>
                        <p>Tips: {artist.tipCount}</p>
                      </div>
                    </div>
                  </div>
                </Layout>
            );
          }
        }}
      </Query>
  );
}

export default withRouter(withApollo(Artist));
