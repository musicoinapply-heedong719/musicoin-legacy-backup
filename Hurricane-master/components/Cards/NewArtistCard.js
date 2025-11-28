import {useQuery} from '@apollo/react-hooks';
import NewArtistsQuery from '../../graphql/query/NewArtistsQuery';

export default function NewArtistCard() {
  const {loading, error, data} = useQuery(NewArtistsQuery, {variables: {limit: 8}});

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;

  return (
      <div className="card">
        <div className="card__title">
          <p>New Artists</p>
        </div>
        <div className="card__content">
          <div className="new-artist">
            <div className="new-artist__badge">
              {data.getNewArtists.map(artist => (
                  <div key={artist.artistAddress} className="new-artist__pic">
                    <img height="48" width="48" src={artist.imageUrl} alt={artist.name} title={artist.name}/>
                  </div>
              ))}

            </div>
            <div className="card__more">
              <a href="#" className="card__more-link">See more new artists</a>
            </div>
          </div>
        </div>
      </div>
  );
}