Backend Update
===

when new package appears in backend or database is changed:

`cd backend`

`composer install --no-dev --prefer-dist`

`vendor/bin/phinx migrate` 

You can configure `phinx.yml` for your own environment and run correspondingly `vendor/bin/phinx migrate -e local` 

If you are on Windows, you must use backslases, i.e. `vendor\bin\phinx`

City IP database installation
===

`cd backend/storage`

Download and unzip IP database from here: `http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.mmdb.gz`
