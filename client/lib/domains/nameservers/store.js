/**
 * Internal dependencies
 */
import { initialDomainState, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const NameserversStore = createReducerStore( reducer );

NameserversStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return ( state[ domainName ] || initialDomainState );
};

export default NameserversStore;
