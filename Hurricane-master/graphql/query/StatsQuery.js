import gql from 'graphql-tag';

const StatsQuery = gql`
    query StatsQuery {
        stats {
            plays
            tips
        }
    }
`;

export default StatsQuery;