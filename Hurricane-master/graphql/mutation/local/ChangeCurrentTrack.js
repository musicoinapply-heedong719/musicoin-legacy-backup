import gql from 'graphql-tag';

const ChangeCurrentTrack = gql`
    mutation ChangeCurrentTrack($track: Release){
        changeCurrentTrack(track: $track) @client
    }
`;

export default ChangeCurrentTrack;