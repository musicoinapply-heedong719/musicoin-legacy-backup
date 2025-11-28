import gql from 'graphql-tag';

const GetReleaseByIdQuery = gql`
    query getReleaseById($id: String) {
        getReleaseById(id: $id) {
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

export default GetReleaseByIdQuery;
