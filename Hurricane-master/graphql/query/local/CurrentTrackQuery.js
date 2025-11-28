import gql from 'graphql-tag';

const CurrentTrackQuery = gql`
    {
        currentTrack @client
    }
`;

export default CurrentTrackQuery;