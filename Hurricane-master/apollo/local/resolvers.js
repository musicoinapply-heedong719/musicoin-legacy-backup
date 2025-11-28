import CurrentTrackQuery from '../../graphql/query/local/CurrentTrackQuery';

export const resolvers = {
    Mutation: {
        changeCurrentTrack: (_root, variables, { cache, getCacheKey }) => {
            cache.writeQuery({query: CurrentTrackQuery, data:{currentTrack: variables.track}});
        },
    },
};