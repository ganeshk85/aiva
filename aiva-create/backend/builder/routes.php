<?php
ini_set('display_errors', 1);
//bind controllers into the container
//$app['pages.controller'] = $app->share(function() use ($app) {
//	return new Builder\Pages\PagesController($app, $app['request'], new Builder\Pages\PageModel);
//});
$app['projects.controller'] = $app->share(function() use ($app) {
	return new Builder\Projects\ProjectsController($app['request'], $app['projects.creator'], $app['projects.repository'], new Builder\Exports\Exporter($app, new Builder\Projects\PageModel, new Builder\Projects\ProjectModel, new Builder\Themes\ThemeModel), $app);
});
$app['home.controller'] = $app->share(function() use ($app) {
    return new Builder\Home\HomeController($app, $app['sentry'], $app['finder']);
});
$app['users.controller'] = $app->share(function() use ($app) {
	return new Builder\Users\UsersController($app, $app['request'], $app['sentry'],
                new Builder\Validation\UserValidator($app, $app['validator']), new Builder\Users\UserCreator($app));
});
$app['users_data.controller'] = $app->share(function() use ($app) {
	return new Builder\Users\UsersDataController($app, $app['request'], $app['sentry']);
});
$app['users_traffic.controller'] = $app->share(function() use ($app) {
	return new Builder\Users\UsersTrafficController($app, $app['request'], $app['sentry']);
});
$app['users_settings.controller'] = $app->share(function() use ($app) {
	return new Builder\Users\UsersSettingsController($app, $app['request'], $app['sentry'],
                new Builder\Validation\UserSettingsValidator($app, $app['validator']));
});
$app['users_clients.controller'] = $app->share(function() use ($app) {
	return new Builder\Users\UsersClientsController($app, $app['request'], $app['sentry'],
                new Builder\Validation\UserClientsValidator($app, $app['validator'], $app['sentry']),
                new Builder\Users\UsersClientsModel());
});

$app['users_options.controller'] = $app->share(function() use ($app) {
    	return new Builder\Users\UsersOptionsController($app, $app['request'], $app['sentry'],
                new Builder\Users\UsersOptionsModel());
});

$app['images.controller'] = $app->share(function() use ($app) {
	return new Builder\Filesystem\Images\ImagesController($app, $app['request'], new Builder\Filesystem\Images\ImageModel, $app['filesystem']);
});
$app['folders.controller'] = $app->share(function() use ($app) {
	return new Builder\Filesystem\Images\FoldersController($app, $app['request'], new Builder\Filesystem\Images\FolderModel);
});
$app['themes.controller'] = $app->share(function() use ($app) {
	$maker = new Builder\Themes\ThemeMaker(new Builder\Themes\Less($app), new Builder\Themes\ThemeModel, $app['filesystem'], $app);
	return new Builder\Themes\ThemesController($app, $app['request'], new Builder\Themes\ThemeModel, $maker);
});
$app['exports.controller'] = $app->share(function() use ($app) {
	$exporter = new Builder\Exports\Exporter($app, new Builder\Projects\PageModel, new Builder\Projects\ProjectModel, new Builder\Themes\ThemeModel);
	return new Builder\Exports\ExportsController($app, $app['request'], $exporter);
});
$app['templates.controller'] = $app->share(function() use ($app) {
	return new Builder\Templates\TemplatesController($app, $app['request'], new Builder\Templates\TemplateModel, $app['imagesSaver']);
});
$app['libraries.controller'] = $app->share(function() use ($app) {
	return new Builder\Libraries\LibrariesController($app, $app['request'], new Builder\Libraries\LibraryModel);
});
$app['update.controller'] = $app->share(function() use ($app) {
	return new Builder\Install\UpdateController($app);
});
$app['settings.controller'] = $app->share(function() use ($app) {
	return new Builder\Settings\SettingsController($app, $app['request'], new Builder\Settings\SettingModel);
});
$app['helpers.controller'] = $app->share(function() {
    return new Builder\Helpers\HelpersController();
});
$app['payments.controller'] = $app->share(function() use ($app) {
    return new Builder\Payments\PaymentsController($app, $app['request'], $app['sentry']);
});

//home
$app->get('/', 'home.controller:index');
$app->get('/custom-elements', 'home.controller:customElements')->before($loggedInFilter);

//users
$app->get('/users', 'users.controller:index')->before($loggedInFilter);
$app->post('/users/token', 'users.controller:getToken');
$app->post('/users/authenticate', 'users.controller:loginWithToken');
$app->post('/users/first-authentication', 'users.controller:firstLoginWithToken');
$app->post('/users/login', 'users.controller:login');
$app->delete('/users/{id}', 'users.controller:delete')->before($loggedInFilter);
$app->post('/users/register', 'users.controller:store');
$app->post('/users/{id}/modify-permissions', 'users.controller:modifyPermissions')->before($loggedInFilter);
$app->post('/users/logout', 'users.controller:logout')->before($loggedInFilter);
$app->post('/assign-permissions-to-all', 'users.controller:assignPermissionsToAll')->before($loggedInFilter);

//user options (integration settings)
$app->get('/users-clients/{name}/options', 'users_options.controller:getOptions')->before($loggedInFilter);
$app->post('/users-clients/{name}/options', 'users_options.controller:saveOptions')->before($loggedInFilter);

//users settings
$app->get('/users-settings/profile', 'users_settings.controller:getProfile')->before($loggedInFilter);
$app->post('/users-settings/profile', 'users_settings.controller:updateProfile')->before($loggedInFilter);
$app->post('/users-settings/password', 'users_settings.controller:updatePassword')->before($loggedInFilter);
$app->get('/users-settings/tracking', 'users_settings.controller:getTracking')->before($loggedInFilter);
$app->post('/users-settings/upload', 'users_settings.controller:upload')->before($loggedInFilter);
$app->post('/users-settings/colors', 'users_settings.controller:colors')->before($loggedInFilter);
$app->post('/users-settings/website-colors', 'users_settings.controller:websiteColors')->before($loggedInFilter);
$app->post('/users-settings/report-color', 'users_settings.controller:reportColor')->before($loggedInFilter);

//user clients
$app->get('/users-clients', 'users_clients.controller:index')->before($loggedInFilter);
$app->get('/users-clients/{id}', 'users_clients.controller:show')->before($loggedInFilter);
$app->post('/users-clients', 'users_clients.controller:store')->before($loggedInFilter);
$app->put('/users-clients/{id}', 'users_clients.controller:update')->before($loggedInFilter);
$app->delete('/users-clients/{id}', 'users_clients.controller:delete')->before($loggedInFilter);

//anayltics data
$app->get('/analytics/report/from/{from}/to/{to}/campaigns/{campaigns}/metrics/{metrics}', "users_data.controller:buildReport")->before($loggedInFilter);
$app->get('/analytics/campaigns/active', "users_data.controller:campaigns")->before($loggedInFilter);
$app->get('/analytics/campaigns/{id}/devices/{devices}/period/from/{from}/to/{to}', "users_data.controller:getCampaignPeriod")->before($loggedInFilter);
$app->get('/analytics/campaigns/{id}/devices/{devices}/breakdown/{date}', "users_data.controller:getCampaignBreakdown")->before($loggedInFilter);
$app->get('/analytics/campaigns/properties/{name}', "users_data.controller:getCampaignProperties")->before($loggedInFilter);
$app->get('/analytics/submissions', "users_data.controller:submissions")->before($loggedInFilter);
$app->get('/analytics/series/health', "users_data.controller:seriesHealth")->before($loggedInFilter);

$app->get('/analytics/emails/campaign/{name}', "users_traffic.controller:emailsByCampaign")->before($loggedInFilter);
$app->get('/analytics/emails', "users_traffic.controller:emails")->before($loggedInFilter);
$app->get('/analytics/urls/campaign/{name}', "users_traffic.controller:urlsByCampaign")->before($loggedInFilter);
$app->get('/analytics/urls', "users_traffic.controller:urls")->before($loggedInFilter);
$app->get('/analytics/traffic/client/{name}', "users_traffic.controller:trafficByClient")->before($loggedInFilter);
$app->get('/analytics/traffic/campaign/{name}', "users_traffic.controller:trafficByCampaign")->before($loggedInFilter);
$app->get('/analytics/traffic', "users_traffic.controller:traffic")->before($loggedInFilter);
$app->get('/analytics/export', "users_traffic.controller:export")->before($loggedInFilter);

//projects
$app->get('/projects/all/thumbnails', "projects.controller:thumbnals")->before($loggedInFilter);
$app->get('/projects/{id}/render/{name}', "projects.controller:render")->value('name', 'index');
$app->get('/projects', "projects.controller:index")->before($loggedInFilter);
$app->get('/projects/{id}', "projects.controller:show")->before($loggedInFilter);
$app->get('/projects/{id}/preview', "projects.controller:preview")->before($loggedInFilter);
$app->post('/projects', "projects.controller:store")->before($loggedInFilter);
$app->post('/projects/{id}/duplicate', "projects.controller:duplicate")->before($loggedInFilter);
$app->post('/projects/export', "projects.controller:export")->before($loggedInFilter);
$app->post('/projects/export/preview/{id}', "projects.controller:preview")->before($loggedInFilter);
$app->put('/projects/{id}', "projects.controller:update")->before($loggedInFilter);
$app->post('/projects/{id}/save-image', 'projects.controller:saveImage')->before($loggedInFilter);
$app->delete('/projects/{id}', "projects.controller:delete")->before($loggedInFilter);
$app->delete('/projects/delete-page/{id}', "projects.controller:deletePage")->before($loggedInFilter);
$app->delete('/projects/{id}/delete-all-pages', "projects.controller:deleteAllPages")->before($loggedInFilter);
$app->post('/projects/{id}/publish', 'projects.controller:publish')->before($loggedInFilter);
$app->post('/projects/{id}/unpublish', 'projects.controller:unpublish')->before($loggedInFilter);
$app->get('/projects/{id}/createTemplate', "projects.controller:createTemplate")->before($loggedInFilter);
$app->put('/projects/{id}/rename/{name}', 'projects.controller:rename')->before($loggedInFilter);

//pages
// $app->post('/pages', "pages.controller:store")->before($loggedInFilter);
// $app->get('/pages', "pages.controller:index")->before($loggedInFilter);

//images
$app->post('/images/', "images.controller:store")->before($loggedInFilter);
$app->get('/images/', "images.controller:index")->before($loggedInFilter);
$app->delete('/images/{id}', "images.controller:delete")->before($loggedInFilter);
$app->post('/images/delete', "images.controller:deleteMultiple")->before($loggedInFilter);

//image folders
$app->post('/folders', "folders.controller:store")->before($loggedInFilter);
$app->get('/folders', "folders.controller:index")->before($loggedInFilter);
$app->delete('/folders/{id}', "folders.controller:delete")->before($loggedInFilter);

//themes
$app->get('/pr-themes/', "themes.controller:index")->before($loggedInFilter);
$app->get('/pr-themes/bootstrap-vars', "themes.controller:bootstrapVars")->before($loggedInFilter);
$app->post('/pr-themes/', 'themes.controller:store')->before($loggedInFilter);
$app->post('/pr-themes/save-image/', 'themes.controller:saveImage')->before($loggedInFilter);
$app->delete('/pr-themes/{id}', "themes.controller:delete")->before($loggedInFilter);

//exports
$app->get('/export/theme/{name}', 'exports.controller:exportTheme')->before($demoFilter)->before($loggedInFilter);
$app->get('/export/page/{id}', 'exports.controller:exportPage')->before($demoFilter)->before($loggedInFilter);
$app->get('/export/project/{id}', 'exports.controller:exportProject')->before($demoFilter)->before($loggedInFilter);
$app->get('/export/image/{path}', 'exports.controller:exportImage')->before($demoFilter)->before($loggedInFilter);
$app->post('/export/project-ftp/{id}', 'exports.controller:exportProjectToFtp')->before($demoFilter)->before($loggedInFilter);

//templates
$app->post('/pr-templates/', 'templates.controller:store')->before($loggedInFilter);
$app->get('/pr-templates/', "templates.controller:index")->before($loggedInFilter);
$app->post('/pr-templates/{id}/save-image', 'templates.controller:saveImage')->before($loggedInFilter);
$app->delete('/pr-templates/{id}', 'templates.controller:delete')->before($loggedInFilter);
$app->put('/pr-templates/{id}', 'templates.controller:update')->before($loggedInFilter);

//libraries
$app->get('/libraries', 'libraries.controller:index')->before($loggedInFilter);
$app->post('/libraries', 'libraries.controller:store')->before($loggedInFilter);
$app->put('/libraries/{id}', 'libraries.controller:update')->before($loggedInFilter);
$app->post('/libraries/attach/{page}/{library}', 'libraries.controller:attachToPage')->before($loggedInFilter);
$app->post('/libraries/detach/{page}/{library}', 'libraries.controller:detachFromPage')->before($loggedInFilter);
$app->delete('/libraries/{id}', 'libraries.controller:delete')->before($loggedInFilter);

// Payment
$app->post('/payment/upgrade-account', 'payments.controller:upgradeAccount')->before($loggedInFilter);
$app->post('/payment/upgrade-website', 'payments.controller:upgradeWebsite')->before($loggedInFilter);
$app->get('/payment/customer', 'payments.controller:customer')->before($loggedInFilter);
$app->post('/payment/card/add', 'payments.controller:addCard')->before($loggedInFilter);
$app->delete('/payment/card/{cardId}', 'payments.controller:deleteCard')->before($loggedInFilter);
$app->get('/payment/card/{cardId}/primary', 'payments.controller:makePrimary')->before($loggedInFilter);
$app->get('/payment/coupon/{couponId}', 'payments.controller:coupon')->before($loggedInFilter);
$app->get('/payment/callback', 'payments.controller:callback');
$app->post('/payment/callback', 'payments.controller:callback');

// Helpers controller routes. Mainly for frontend
$app->get('/helpers/twitter/{username}', 'helpers.controller:verifyTwitterUsername');

//update
$app->get('update', 'update.controller:index');
$app->post('run-update', 'update.controller:runUpdate');

//settings
$app->post('save-settings', 'settings.controller:update');
$app->get('settings', 'settings.controller:index');

//translations
$app->get('/trans-messages', function() use($app) {
	$messages = $app['translator']->getMessages($app['request']->query->get('lang'));
	return json_encode($messages['messages']);
})->before($loggedInFilter);

if ($app['is_demo']) {

	$app->get('reset', function() use($app) {
		$r = new Builder\Database\Reseter($app, new Builder\Install\Seeder($app, $app['projects.creator']));
		return $r->reset();
	});

	$app->get('time-until-reset', function() use($app) {
		$r = new Builder\Database\Reseter($app, new Builder\Install\Seeder($app, $app['projects.creator']));
		return $r->timeUntilReset();
	});
}

// $app->get('seed-templates', function() use($app) {
// 	$s = new Builder\Install\Seeder($app, $app['projects.creator']);
//
//     $s->seedTemplates();
// });
