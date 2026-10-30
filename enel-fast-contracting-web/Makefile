all: run

vendor: node_modules
node_modules: yarn.lock
	yarn
	touch $@

compile: vendor
	yarn run compile

production: export NODE_ENV=production
production: compile
	pm2 start pm2.config.js

staging: export NODE_ENV=staging
staging: compile
	pm2 start pm2.config.js

dev: vendor
	DEBUG=app:* node ./bin/server

mockAPI: export REACT_MOCK_API=true
mockAPI: vendor
	DEBUG=app:* node ./bin/server

run: dev
