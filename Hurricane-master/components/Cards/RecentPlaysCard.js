import React from 'react';
import Track from '../Track';

class RecentlyPlayedCard extends React.Component {
  componentDidMount() {
    this.props.subscribeToMore();
  }

  render() {
    return (
        <div className="card">
          <div className="card__title">
            <p>Recently Played</p>
            <div className="card__filter">
              <a href="#" className="card__filter-link active">Day |</a>
              <a href="#" className="card__filter-link">Week |</a>
              <a href="#" className="card__filter-link">Month </a>
            </div>
          </div>
          <div className="card__content">
            <div className="top-tips">
              <div className="track-container">
                {this.props.data.map(release => (
                    <Track image="/img/tracks/tracks-1.png" track={release}/>
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

export default RecentlyPlayedCard;