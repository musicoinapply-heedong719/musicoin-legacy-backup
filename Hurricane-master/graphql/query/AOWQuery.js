import gql from 'graphql-tag';

const AOWQuery = gql`
    query getArtistOfTheWeek {
        getArtistOfTheWeek {
            artist{
                name
                imageUrl
                artistAddress
            }
            release{
                id
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
    }
`;

export default AOWQuery;