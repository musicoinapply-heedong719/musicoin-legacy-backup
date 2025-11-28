import gql from 'graphql-tag';

const GetNewArtists = gql`
    query getNewArtists($limit: Int) {
        getNewArtists(limit: $limit) {
            artistAddress
            description
            name
            imageUrl
            verified
            followers
            tipCount
        }
    }
`;

export default GetNewArtists;