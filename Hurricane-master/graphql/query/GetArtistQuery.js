import gql from 'graphql-tag';

const GetArtistQuery = gql`
    query trendingList($id:String) {
        getArtist(id: $id) {
            artistAddress
            description
            name
            imageUrl
            verified
            followers
            tipCount
            artistTracks {
                id
                tx
                title
                artistName
                directTipCount
                directPlayCount
                trackDescription
                genres
                trackImg
                trackUrl
            }
        }
    }
`;

export default GetArtistQuery;
