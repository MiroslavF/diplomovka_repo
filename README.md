## Install Node js

https://nodejs.org/en/

Version 14.11.0 was used during development.
```bash
# check if node & npm is installed
node -v # v14.11.0
npm -v # 6.14.8
```

## Install MariaDb

https://mariadb.org/

With MariaDb install also HeidiSQL (comes with MariabDb by default), or optionally some other MySQL database client that can be used to import the database.

## Import Database

Import database by running `diplomovkaSQL.sql` file using HeidiSQL or other MySQL database client.

## Install NPM packages

Navigate to directory with source code - file `package.json` must be in the root of the directory. Then run:

```
npm install
```

## Configure Database connection

In file `config.js` configure the following fields
```
database: {
    host: 'localhost',
    name: 'diplomovka',
    pass: {password},
    port: {used_port},
    user: '{root_user_name}',
},
```

## Run application

Make sure MariaDB service is running.

In root project directory:
```
npm start
```

## Display results

In your browser go to:
```bash
http://localhost:8080/ # to see platform agnostic network analysis results
http://localhost:8080/steam # to see results of the analysis specific for Steam platform
```

Results are being cached after the first calculation. Therefore the first startup will take very long time. Progress of long calculations are continuously logged in console.

Experiment with file `config.js` to alter the displayed results. Some changes may require the deletion of cached files to recalculate.