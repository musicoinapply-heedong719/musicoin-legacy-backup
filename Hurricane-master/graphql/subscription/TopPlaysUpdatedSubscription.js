import gql from 'graphql-tag';

const topPlaysUpdatedSubscription = gql`
    subscription topPlaysUpdated{
        topPlaysUpdated {
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

export default topPlaysUpdatedSubscription;