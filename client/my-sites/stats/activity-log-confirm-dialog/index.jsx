/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityIcon from '../activity-log-item/activity-icon';
import Button from 'components/button';
import Card from 'components/card';
import Gridicon from 'gridicons';

class ActivityLogConfirmDialog extends Component {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
		onClose: PropTypes.func.isRequired,
		onConfirm: PropTypes.func.isRequired,
		timestamp: PropTypes.number,

		// Localize
		translate: PropTypes.func.isRequired,
		moment: PropTypes.func.isRequired,
	};

	renderButtons() {
		const { onClose, onConfirm, translate } = this.props;
		return (
			<div>
				<a
					className="activity-log-confirm-dialog__more-info-link"
					href="https://help.vaultpress.com/one-click-restore/"
				>
					{ translate( '{{icon /}} More info', {
						components: { icon: <Gridicon icon={ 'notice' } /> },
					} ) }
				</a>
				<a
					className="activity-log-confirm-dialog__more-info-link"
					href="https://help.vaultpress.com/one-click-restore/"
				>
					{ translate( '{{icon /}} Any Questions?', {
						components: { icon: <Gridicon icon={ 'chat' } /> },
					} ) }
				</a>
				<Button onClick={ onClose }>{ translate( 'Cancel' ) }</Button>
				<Button primary scary onClick={ onConfirm }>
					{ translate( 'Restore' ) }
				</Button>
			</div>
		);
	}

	render() {
		const { applySiteOffset, moment, timestamp, translate } = this.props;

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="activity-log-item activity-log-item__restore-confirm">
				<div className="activity-log-item__type">
					<ActivityIcon activityIcon={ 'history' } />
				</div>
				<Card className="activity-log-item__card">
					<h1>{ translate( 'Rewind Site' ) }</h1>

					<p className="activity-log-confirm-dialog__highlight">
						{ translate(
							'This is the selected point for your site Rewind.' +
								'Are you sure you want to rewind your site back to ' +
								'{{b}}%(time)s{{/b}}?',
							{
								args: {
									time: applySiteOffset( moment.utc( timestamp ) ).format( 'LLL' ),
								},
								components: { b: <b /> },
							}
						) }
					</p>
					<p>
						<Gridicon icon={ 'notice' } />
						{ translate(
							'This will remove all content and options created or changed since then.'
						) }
					</p>

					<div className="activity-log-confirm-dialog__button-wrap">{ this.renderButtons() }</div>
				</Card>
			</div>
		);
	}
}

export default localize( ActivityLogConfirmDialog );
