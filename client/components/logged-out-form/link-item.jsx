/**
 * External dependencies
 */
import classnames from 'classnames';
import { omit } from 'lodash';
import PropTypes from 'prop-types';

import React from 'react';

export default React.createClass( {
	displayName: 'LoggedOutFormLinkItem',

	propTypes: {
		className: PropTypes.string
	},

	render() {
		return (
			<a
				{ ...omit( this.props, 'classNames' ) }
				className={ classnames( 'logged-out-form__link-item', this.props.className ) }
			>
				{ this.props.children }
			</a>
		);
	}
} );
