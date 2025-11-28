import gql from 'graphql-tag';

const trendingListUpdatedSubscription = gql`
    subscription trendingListUpdated{
        trendingListUpdated {
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
`;

export default trendingListUpdatedSubscription;