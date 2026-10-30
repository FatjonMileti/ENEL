# fsd-ppc

> Backend for mobile app dealing with new/upgraded contracts

## About

This project uses [Feathers](http://feathersjs.com). An open source web framework for building modern real-time applications.

## Production and Staging Notes

`mkdir logs & cd logs & mkdir smses`

`hummus` and `bcrypt` are needed but are excluded from dependencies because of environment build problems.

run `npm install` manually on the production machine and copy it to the node modules folder.

parcel build needs to run at least once without the hummus and bcrypt dependencies in development

## Scaffolding

Feathers has a powerful command line interface. Here are a few things it can do:

```
$ npm install -g @feathersjs/cli          # Install Feathers CLI

$ feathers generate service               # Generate a new Service
$ feathers generate hook                  # Generate a new Hook
$ feathers generate model                 # Generate a new Model
$ feathers help                           # Show all commands
```

##Database
Run `docker-compose up` to run a container based database OR use a locally installed one.

##First time setup and run

##Use node version 10 with nvm

###Database setup

Run the below migration to create the database defined in PG_CONNECTION_STRING
```sh
npx sequelize db:create
```
Then manually create the schema defined in PG_SCHEMA.

###Running for the first time

Run with `npm run local` so that the tables are created for the first time

###Running migrations before

This will update the structure of the database to the latest version with the scripts inside the `migrations` folder.

Before running it make sure to have created the schema defined in `schema` inside `migrations/db.json` according to the appropriate `NODE_ENV`. It will be used to track the finished migrations:

```sh
npx sequelize db:migrate
```

###Running the seeders

This will prefill the database with some users and city data
```sh
npx sequelize db:seed:all
```
