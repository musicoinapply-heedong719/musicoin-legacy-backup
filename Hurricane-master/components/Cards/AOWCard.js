import {useMutation, useQuery} from '@apollo/react-hooks';
import AOWQuery from '../../graphql/query/AOWQuery';
import ChangeCurrentTrack from '../../graphql/mutation/local/ChangeCurrentTrack';

export default function AOWCard() {
  const {loading, error, data} = useQuery(AOWQuery);

  if (loading) return 'Loading...';
  if (error) return `Error! ${error.message}`;
  const aow = data.getArtistOfTheWeek;
  const [changeCurrentTrack] = useMutation(ChangeCurrentTrack, {variables:{track: aow.release}});

  return (
      <div className="card">
        <div className="card__title">
          <p>Artist of the week</p>
        </div>
        <div className="card__content">
          <div className="aow">
            <div className="aow__container">
              <div className="aow__pic">
                <img src={aow.artist.imageUrl} alt="" className="aow__pic-file"/>
              </div>
              <div className="aow__attr">
                <div className="aow__attr--player" onClick={changeCurrentTrack}>
                  <img src="/img/icons/play.png" alt=""/>
                </div>
                <div className="aow__attr-text">
                  <p className="aow__attr-track">{aow.release.title}</p>
                  <p className="aow__attr-artist">{aow.artist.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

  );
}