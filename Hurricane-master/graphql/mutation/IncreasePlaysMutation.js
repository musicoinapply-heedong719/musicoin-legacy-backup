import gql from 'graphql-tag';

const IncreasePlaysMutation = gql`
    mutation increasePlays($releaseId: String){
        increasePlays(releaseId: $releaseId){
            tips
            plays
        }
    }
`;

export default IncreasePlaysMutation;