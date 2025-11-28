import {useQuery} from '@apollo/react-hooks';
import DebutsQuery from '../../graphql/query/DebutsQuery';

export default function DebutsCard() {
  const {loading, error, data} = useQuery(DebutsQuery, {variables: {limit: 8}});

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
      <div className="card">
        <div className="card__title">
          <p>Debuts</p>
        </div>
        <div className="card__content">
          <div className="new-artist">
            <div className="new-artist__badge">
              {data.getDebuts.map(track => (
                  <div key={track.id} className="new-artist__pic">
                    <img height="48" width="48" src={track.trackImg} alt={`${track.title} - ${track.artistName}`} title={`${track.title} - ${track.artistName}`}/>
                  </div>
              ))}

            </div>
            <div className="card__more">
              <a href="#" className="card__more-link">See more debuts</a>
            </div>
          </div>
        </div>
      </div>
  );
}