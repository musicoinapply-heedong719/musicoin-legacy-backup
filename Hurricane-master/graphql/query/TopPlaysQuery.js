import gql from 'graphql-tag';

const TopPlaysQuery = gql`
    query topPlays($limit:Int) {
        topPlays(limit: $limit) {
            id
            artistId
            tx
            title
            artistName
            directTipCount
            directPlayCount
            trackDescription
            genres
            trackImg
        }
    }
`;

export default TopPlaysQuery;
