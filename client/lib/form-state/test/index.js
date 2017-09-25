/**
 * External dependencies
 */
import { assign, constant, mapValues, zipObject } from 'lodash';

/**
 * Internal dependencies
 */
import formState from '../';
import assert from 'assert';

function checkNthState( n, callback ) {
	let count = 0;

	return function( state ) {
		if ( count === n ) {
			callback( state );
		}

		count++;
	};
}

function testController( options ) {
	let fieldNames, defaults;

	fieldNames = options.fieldNames;

	defaults = {
		loadFunction: function( onComplete ) {
			const fieldValues = zipObject( fieldNames, fieldNames.map( constant( 'loaded' ) ) );
			onComplete( null, fieldValues );
		},

		validatorFunction: function( fieldValues, onComplete ) {
			const fieldErrors = mapValues( fieldValues, constant( [] ) );
			onComplete( null, fieldErrors );
		},

		onNewState: function() {},

		debounceWait: 0
	};

	return formState.Controller( assign( defaults, options ) );
}

describe( 'index', function() {
	describe( '#Controller', function() {
		describe( '#getInitialState', function() {
			it( 'returns disabled fields', function() {
				let controller = testController( { fieldNames: [ 'firstName' ] } ),
					state = controller.getInitialState();

				assert.strictEqual( formState.isFieldDisabled( state, 'firstName' ), true );
			} );
		} );

		it( 'enables the fields on the first event', function( done ) {
			let onNewState;

			onNewState = checkNthState( 0, function( state ) {
				assert.strictEqual( formState.isFieldDisabled( state, 'firstName' ), false );
				done();
			} );

			testController( {
				fieldNames: [ 'firstName' ],
				onNewState: onNewState
			} );
		} );

		describe( '#handleFieldChange', function() {
			it( 'updates the field value', function( done ) {
				let onNewState,
					controller;

				onNewState = checkNthState( 1, function( state ) {
					assert.strictEqual( formState.getFieldValue( state, 'firstName' ), 'foo' );
					done();
				} );

				controller = testController( {
					fieldNames: [ 'firstName' ],
					onNewState: onNewState
				} );

				controller.handleFieldChange( {
					name: 'firstName',
					value: 'foo'
				} );
			} );

			it( 'validates the new value', function( done ) {
				let validatorFunction,
					onNewState,
					controller;

				validatorFunction = function( fieldValues, onComplete ) {
					onComplete( null, { firstName: [ 'invalid' ] } );
				};

				onNewState = checkNthState( 3, function( state ) {
					assert.deepEqual( formState.getErrorMessages( state ), [ 'invalid' ] );
					done();
				} );

				controller = testController( {
					fieldNames: [ 'firstName' ],
					validatorFunction: validatorFunction,
					onNewState: onNewState
				} );

				controller.handleFieldChange( {
					name: 'firstName',
					value: 'foo'
				} );
			} );

			context( 'when there are multiple changes at once', function() {
				it( 'only shows errors for the latest values', function( done ) {
					let validatorFunction,
						onNewState,
						controller;

					validatorFunction = function( fieldValues, onComplete ) {
						onComplete( null, {
							firstName: fieldValues.firstName.length > 0 ? [] : [ 'invalid' ]
						} );
					};

					onNewState = checkNthState( 4, function( state ) {
						assert.deepEqual( formState.getErrorMessages( state ), [ 'invalid' ] );
						done();
					} );

					controller = testController( {
						fieldNames: [ 'firstName' ],
						validatorFunction: validatorFunction,
						onNewState: onNewState
					} );

					controller.handleFieldChange( {
						name: 'firstName',
						value: 'foo'
					} );

					controller.handleFieldChange( {
						name: 'firstName',
						value: ''
					} );
				} );
			} );
		} );
	} );
} );
