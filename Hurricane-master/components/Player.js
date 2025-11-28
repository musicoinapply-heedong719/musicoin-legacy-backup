import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import CurrentTrackQuery from '../graphql/query/local/CurrentTrackQuery';
import IncreasePlaysMutation from '../graphql/mutation/IncreasePlaysMutation';
import {Query} from 'react-apollo';
import {graphql} from 'react-apollo';
import StatsQuery from '../graphql/query/StatsQuery';

let secondsCount = 0;
let lastTrack;

class Player extends React.Component {

  listen(track) {
    if(lastTrack != track) {
      lastTrack = track;
      secondsCount = 1;
    }else{
      secondsCount++;
    }
    console.log(secondsCount + ' seconds played');
    if (secondsCount == 30) {
      this.props.mutate({
        variables: {releaseId: track.id},
        update: (cache, {data: {increasePlays}}) => {
          const {stats} = cache.readQuery({query: StatsQuery});
          cache.writeQuery({
            query: StatsQuery,
            data: {stats: increasePlays},
          });
        },
      });
      console.log('We can consider this song to be \'played\' now!');
    }
  }

  render() {
    return (
        <div>
          <Query query={CurrentTrackQuery}>
            {({loading, error, data}) => {
              if (loading) return <p>Loading...</p>;
              if (error) return <p>Error: {error.message}</p>;
              if (data && data.currentTrack) {
                let trackInfo = data.currentTrack.title + ' - ' + data.currentTrack.artistName;
                return (
                    <AudioPlayer
                        src={data.currentTrack.trackUrl}
                        controls
                        listenInterval={1000}
                        onListen={() => this.listen(data.currentTrack)}
                        autoPlay
                        footer={trackInfo}
                    />);
              } else {
                return null;
              }
            }}
          </Query>
        </div>
    );
  };
};

export default graphql(IncreasePlaysMutation)(Player);