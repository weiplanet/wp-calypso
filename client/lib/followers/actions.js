/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import Dispatcher from 'dispatcher';
import FollowersStore from 'lib/followers/store';

import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:followers-actions' );

const FollowersActions = {
	fetchFollowers: ( fetchOptions, silentUpdate = false ) => {
		const paginationData = FollowersStore.getPaginationData( fetchOptions );
		if ( paginationData.fetchingUsers ) {
			return;
		}
		debug( 'fetchFollowers', fetchOptions );
		if ( ! silentUpdate ) {
			Dispatcher.handleViewAction( {
				type: 'FETCHING_FOLLOWERS',
				fetchOptions: fetchOptions
			} );
		}
		wpcom.undocumented().site( fetchOptions.siteId ).fetchFollowers( fetchOptions, function( error, data ) {
			Dispatcher.handleServerAction( {
				type: 'RECEIVE_FOLLOWERS',
				fetchOptions: fetchOptions,
				data: data,
				error: error
			} );
		} );
	},

	removeFollower: ( siteId, follower ) => {
		Dispatcher.handleViewAction( {
			type: 'REMOVE_FOLLOWER',
			siteId: siteId,
			follower: follower
		} );
		wpcom.undocumented().site( siteId ).removeFollower( follower.ID, function( error, data ) {
			if ( error ) {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_FOLLOWER_ERROR',
					siteId: siteId,
					follower: follower,
					error: error
				} );
			} else {
				Dispatcher.handleServerAction( {
					type: 'RECEIVE_REMOVE_FOLLOWER_SUCCESS',
					siteId: siteId,
					follower: follower,
					data: data
				} );
			}
		} );
	}
};

export default FollowersActions;
