import gql from 'graphql-tag';

const TrendingReleasesQuery = gql`
    query trendingList($limit:Int) {
        trendingList(limit: $limit) {
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
            trackUrl
        }
    }
`;

export default TrendingReleasesQuery;
