import gql from 'graphql-tag';

const recentPlaysUpdatedSubscription = gql`
    subscription recentPlaysUpdated{
        recentPlaysUpdated {
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

export default recentPlaysUpdatedSubscription;