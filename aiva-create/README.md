# **READ ME 2.0** #

1. [Install XAMPP](https://www.apachefriends.org/download.html), use the version with PHP 5.6.XX. Start the **Apache** and **MySQL** services.
2. Using your Git software, clone [aiva-create](https://bitbucket.org/teamaiva/aiva-create.git) to `xampp/htdocs/aiva-create`.
3. Download and install [Composer](https://getcomposer.org/download/)
      * Navigate to `\xampp\php\php.exe` when asked for the command-line PHP you want to use.
      * Leave proxy settings blank.
      * Check that composer successfully installed by opening CMD and punching in [composer](http://i.imgur.com/e0R0SZz.png).

4. Using the git terminal, navigate to `\backend` and then punch in `composer install --no-dev --prefer-dist`.
5. Using windows explorer, navigate to: `backend/vendor/cartalyst/sentry/src/Cartalyst/Sentry/Users/Eloquent/User.php`.
6. Open `User.php` and remove `'persist_code',` in the [protected $hidden array](http://i.imgur.com/IAkWl1Z.png).
7. Change permissions to the `aiva-create` directory so all contents are read and writable.
8. **MacOS**: click the gear and hit `Apply to enclosing items`
9. Create Database:
      * Open web browser and go to `localhost/phpmyadmin`.
      * Click new in the left column.
      * Name the database 'Architect'.
10. Clone the [**aiva-create-screenshot**](https://bitbucket.org/teamaiva/aiva-create-screenshot) repo outside the aiva-create directory.
11. Install [Node.js](https://nodejs.org/en/).
12. Navigate to the aiva-create-screenshot repo in windows explorer. `Shift` + `Right Click` on the window and
`Open command window here`.
13. Run `npm install`.
14. Open `localhost/aiva-create` and go through the steps.
15. Remove all rows/entries in the architect pages table using phpmyadmin (http://localhost/phpmyadmin)
16. Using Git Terminal, run [`vendor/bin/phinx migrate`](http://i.imgur.com/vZgRgmb.png) in the `backend` directory of `aiva-create`.
17. Update `.env` file (backend/.env) with SCREENSHOT_CMD="node ABSOLUTE/PATH/TO/screenshot.js"
example: `SCREENSHOT_CMD="node /opt/aiva-create-screenshot/screenshot.js"`

-------------------------------------------------------------------------------------

# README

The back end 😉

## Setup

1. [Install XAMPP](https://www.apachefriends.org/download.html) (make sure you run `mysql.server stop` first), start the apache and mysql service
2. Inside your `xampp/htdocs/` `git clone <INSERT YOUR HTTPS LINK>`
 Example: git clone https://aeslami@bitbucket.org/teamaiva/aiva-create.git
3. `git pull origin master`
4. Download and install Composer https://getcomposer.org/download/
5. `cd backend`
6. `composer install --no-dev --prefer-dist`
7. remove the `'persist_code',` line from backend/vendor/cartalyst/sentry/src/Cartalyst/Sentry/Users/Eloquent/User.php in the protected $hidden array.
8. Change permissions to the `aiva-create` directory and all contents to Everyone Read & Write
1. **MacOS**: click the gear and hit `Apply to enclosing items`
9. Create database:
1. Go to phpmyadmin: `localhost/phpmyadmin`
2. Click `New` in the left column
3. Name it `architect`
10. clone the aiva-create-screenshot repo outside the aiva-create directory
11. run `npm install` in the location you cloned the aiva-create-screenshot repo
12. open `localhost/aiva-create` and go throught the steps
13. run `vendor/bin/phinx migrate` in the backend directory
14. Update `.env` file (backend/.env) with SCREENSHOT_CMD="node ABSOLUTE/PATH/TO/screenshot.js"
example: `SCREENSHOT_CMD="node /opt/aiva-create-screenshot/screenshot.js"`

## Recompiling Builder.min.js and .css

When changes are made to js and css/less files you must recompile to see the changes.

To recompile you must have node.js installed.

In the main project directory run:

1. `npm install`
2. `npm install gulp -g`
3. `gulp`

From now on you only need to run the gulp command to recompile. The gulp compiler runs indefinitely until killed.

## Backend Updates

when new package appears in backend or database is changed:

* Make sure you have [downloaded and installed Composer](https://getcomposer.org/download/).
* `cd backend`
* `composer install --no-dev --prefer-dist`
* `vendor/bin/phinx migrate`
     * You can configure `phinx.yml` for your own environment and run correspondingly `vendor/bin/phinx migrate -e local`
* If you are on Windows, you must use backslashes, i.e. `vendor\bin\phinx`

## Adding a new Component to architect

* Add your routes: `backend/builder/routes.php`
    * bind controller to container at the top of the document
    * lower down, put the routes
* Add your controller(s): `backend/builder/<Component>/<Component>Controller.php`
    * Because Sylex has different method of returning, you need to return `Response` objects, instead of the value you want
        * e.g. `return new Response($value, 200);`
        * e.g. `return new Response($err, 403);`
* Add views: `views/<component>`
* Modify angular stuff: `assets/js/builder/app.js`