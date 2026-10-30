# Footprints Location-Based Marketing CMS

```
cp .env.example .env
nano .env
```

## Requirements

-   Node >= 8(10.13.0 is the actual working vesion at the moment)
    To use specific NodeJS version - you can use nvm(Node Version Management)
-   If you use NVM - npm of proper version(6.4.1) will be installed by default

## Install

1. Clone the project

2. Copy `.env.example` to `.env` and update environment variables

3. nvm use 10.13.0 - to use proper version of NodeJS

4. <b>npm i</b> in project root folder to install dependencies

5. <b>npm run start</b>(start local development)

## Docs

```
Username: admin
Password: admin
```

```
# start local
yarn start

# start production
export NODE_ENV=production
yarn run compile
yarn start
```


<!-- comment -->


