(function(angular) {
	'use strict';

	angular.module('angulartics.google.tagmanager', ['angulartics'])
		.config(['$analyticsProvider',
			function($analyticsProvider) {
				$analyticsProvider.registerPageTrack(function(path) {
					var dataLayer = window.dataLayer = window.dataLayer || [];
					dataLayer.push({
						'event': 'content-view',
						'content-name': path
					});
				});
				$analyticsProvider.registerEventTrack(function(action, properties) {
					var dataLayer = window.dataLayer = window.dataLayer || [];
					dataLayer.push({
						'event': 'interaction',
						'target': properties.category,
						'action': action,
						'target-properties': properties.label,
						'value': properties.value,
						'interaction-type': properties.noninteraction
					});

				});
			}
		]);
})(angular);