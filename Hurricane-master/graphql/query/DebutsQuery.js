import gql from 'graphql-tag';

const GetDebuts = gql`
    query getDebuts($limit: Int) {
        getDebuts(limit: $limit) {
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

export default GetDebuts;
