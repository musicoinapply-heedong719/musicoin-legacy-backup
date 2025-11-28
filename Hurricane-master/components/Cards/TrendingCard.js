import React from 'react';
import Track from '../Track';

class TrendingCard extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore();
  }

  render() {
    return (
        <div className="card">
          <div className="card__title">
            <p>Trending</p>
          </div>
          <div className="card__content">
            <div className="top-tips">
              <div className="track-container">
                {this.props.data.map(release => (
                    <Track key={release.tx} image="/img/tracks/tracks-1.png" track={release}/>
                ))}
                <div className="card__more">
                  <a href="#" className="card__more-link">See more</a>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
  }
}

export default TrendingCard;