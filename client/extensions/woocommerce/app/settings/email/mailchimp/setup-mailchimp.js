/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { pick, some, isEmpty } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import Card from 'components/card';
import { localize } from 'i18n-calypso';
import Dialog from 'components/dialog';
import ProgressIndicator from 'components/wizard/progress-indicator';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import { submitMailChimpApiKey, submitMailchimpStoreInfo } from 'woocommerce/state/sites/settings/email/actions.js';
import { isSubbmittingApiKey, isApiKeyCorrect } from 'woocommerce/state/sites/settings/email/selectors';
import StoreInfoStep from './setup-steps/store-info.js';
import {
	getStoreLocation,
} from 'woocommerce/state/sites/settings/general/selectors';

const LOG_INTO_MAILCHIMP_STEP = 'log_into';
const KEY_INPUT_STEP = 'key_input';
const STORE_INFO_STEP = 'store_info';
const CAMPAIGN_DEFAULTS_STEP = 'campaign_defaults';
const NEWSLETTER_SETTINGS_STEP = 'newsletter_settings';

const steps = {
	[ LOG_INTO_MAILCHIMP_STEP ]: { number: 0, nextStep: KEY_INPUT_STEP },
	[ KEY_INPUT_STEP ]: { number: 1, nextStep: STORE_INFO_STEP },
	[ STORE_INFO_STEP ]: { number: 2, nextStep: CAMPAIGN_DEFAULTS_STEP },
};

const LogIntoMailchimp = localize( ( { translate } ) => (
	<Button href="https://login.mailchimp.com/" target="_blank" >
		{ translate( 'Signup or log in to MailChimp' ) }
	</Button>
) );

const KeyInputStep = localize( ( { translate, onChange, apiKey, isKeyCorrect } ) => (
	<FormFieldset className="mailchimp__setup-mailchimp-key-input">
		<FormLabel required={ true }>
			{ translate( 'Mailchimp API Key:' ) }
		</FormLabel>
		<FormTextInput
			name={ 'api_key' }
			isError={ ! isKeyCorrect }
			placeholder={ 'Enter your MailChimp API key' }
			onChange={ onChange }
			value={ apiKey }
		/>
		{ ! isKeyCorrect && <FormInputValidation isError text="Key appears to be invalid" /> }
		<div>
			<span>{ translate( 'To find your Mailchimp API key, go to ' ) }</span>
			<span>{ translate( 'settting > Extras > API keys' ) }</span>
			<div>{ translate( 'From there, grab an existing key or generate a new on for your store' ) } </div>
		</div>
	</FormFieldset>
) );

const storSettingsRequriredFields = [ 'store_name', 'store_street', 'store_city', 'store_state',
	'store_postal_code', 'store_country', 'store_phone', 'store_locale', 'store_timezone',
	'store_currency_code', 'admin_email' ];

class MailChimpSetup extends React.Component {

	constructor( props ) {
		super( props );
		// make this react to the real phase the execution is.
		this.state = {
			step: LOG_INTO_MAILCHIMP_STEP,
			settings: this.props.settings,
			settings_values_missing: false,
			api_key_input: this.props.settings.mailchimp_api_key
		};
	}

	componentWillReceiveProps( nextProps ) {
		if ( ( nextProps.settings.active_tab === STORE_INFO_STEP ) &&
			( this.state.step === KEY_INPUT_STEP ) ) {
			this.setState( { step: STORE_INFO_STEP } );
		}
	}

	onClose = () => {
		this.props.onClose();
	}

	getStoreSettings= () => {
		// clear this and pass only what is required.
		const { address } = this.props;

		const settings = pick( this.state.settings, storSettingsRequriredFields );
		settings.store_city = address.city;
		settings.store_street = address.street + ' ' + address.street2;
		settings.store_state = address.state;
		settings.store_country = address.country;
		settings.store_postal_code = address.postcode;
		console.log( this.props.address );
		return settings;
	}

	areStoreSettingsValid = ( settings ) => {
		const hasAllKeys = storSettingsRequriredFields.every( key => key in settings );
		if ( ! hasAllKeys ) {
			return false;
		}
		const hasEmptyValues = some( settings, isEmpty );
		if ( hasEmptyValues ) {
			return false;
		}
		if ( settings.store_phone.length <= 6 ) {
			return false;
		}

		return true;
	}

	next = () => {
		if ( this.state.step === KEY_INPUT_STEP ) {
			this.props.submitMailChimpApiKey( this.props.siteId, this.state.api_key_input );
			return;
		} else if ( this.state.step === STORE_INFO_STEP ) {
			const settings = this.getStoreSettings();
			console.log( settings );
			const validSettings = this.areStoreSettingsValid( settings );
			if ( ! validSettings ) {
				this.setState( { settings_values_missing: true } );
				return;
			}
			this.setState( { settings_values_missing: false } );

			this.props.submitMailchimpStoreInfo( this.props.siteId, settings );
			return;
		}
		this.setState( { step: steps[ this.state.step ].nextStep } );
	}

	onKeyInputChange = ( e ) => {
		this.setState( { api_key_input: e.target.value } );
	}

	// Right now Store info is combination of values from SettingsPaymentsLocationCurrency
	// and managed directly - not the greatest option but good for now.
	onStoreInfoChange = ( e ) => {
		this.setState( { settings: Object.assign( {}, this.state.settings, { [ e.target.name ]: e.target.value } ) } );
	}

	renderStep = () => {
		const { step } = this.state;
		if ( step === LOG_INTO_MAILCHIMP_STEP ) {
			return <LogIntoMailchimp />;
		}
		if ( step === KEY_INPUT_STEP ) {
			return <KeyInputStep
				onChange={ this.onKeyInputChange }
				apiKey={ this.state.api_key_input }
				isKeyCorrect={ this.props.isKeyCorrect } />;
		}
		if ( step === STORE_INFO_STEP ) {
			return <StoreInfoStep
				onChange={ this.onStoreInfoChange }
				storeData={ this.state.settings }
				validateFields={ false }
			/>;
		}

		return <div></div>;
	}

	render() {
		const { translate } = this.props;
		const isButtonBusy = this.props.isBusy ? 'is-busy' : '';
		const buttons = [
			{ action: 'cancel', label: translate( 'Cancel' ) },
			{ action: 'next', label: translate( 'Next' ), onClick: this.next, isPrimary: true, additionalClassNames: isButtonBusy },
		];

		console.log( this.state.api_key_input );
		return (
			<Dialog
				isVisible={ true }
				buttons={ buttons }
				onClose={ this.onClose }>
				<ProgressIndicator
					stepNumber={ steps[ this.state.step ].number }
					totalSteps={ 3 } />
				{ this.renderStep() }
			</Dialog>
		);
	}
}

export default localize( connect(
	( state, props ) => {
		const subbmittingApiKey = isSubbmittingApiKey( state, props.siteId );
		const isKeyCorrect = isApiKeyCorrect( state, props.siteId );
		const address = getStoreLocation( state );
		const isBusy = subbmittingApiKey;
		return {
			isBusy,
			address,
			isKeyCorrect
		};
	},
	{
		submitMailChimpApiKey,
		submitMailchimpStoreInfo,
	}
)( MailChimpSetup ) );