/**
 * Internal dependencies
 */
import { combineReducers, keyedReducer } from 'state/utils';
import currency from './currency/reducer';
import methods from './methods/reducer';

const methodsReducer = combineReducers( {
	currency,
	methods,
} );

export default keyedReducer( 'siteId', methodsReducer );
