import gql from 'graphql-tag';

const playsIncreasedSubscription = gql`subscription playsIncreased{
    playsIncreased {
        plays
        tips
    }
}
`;

export default playsIncreasedSubscription;