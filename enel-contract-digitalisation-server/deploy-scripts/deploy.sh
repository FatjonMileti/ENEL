#!/bin/bash
. $HOME/.bashrc

BACKUP_PATH=/app/enel-backup
WORKING_PATH=/app/enel
TEMP_PATH=/app/enel-temp
LOG=/app/enel-auto/log
REPO_URL=https://fsd-deployment:FA+9qCX9VSu@bitbucket.org/fullscreendigital/enel-contract-digitalisation-server.git
NPX=/app/nodejs/node-v8.9.4/bin/npx

echo "backing up $WORKING_PATH in $BACKUP_PATH"
rm -rf $BACKUP_PATH
cp -r $WORKING_PATH $BACKUP_PATH
echo "git clone in $TEMP_PATH"
git clone --progress --branch=qas $REPO_URL $TEMP_PATH || exit "$?"
echo "move $TEMP_PATH to $WORKING_PATH"
cp -r $TEMP_PATH/. $WORKING_PATH
cd $WORKING_PATH
$NPX npm install --production
NODE_ENV=test $NPX sequelize db:migrate
$NPX npm run cms-build
$NPX npm run cms-v2-build
$NPX pm2 delete all
$NPX pm2 start pm2start.qas.config.js
pkill stomp_read
nohup /app/nodejs/node-v8.9.4/bin/node docprint.processor/stomp_read.js &> /dev/null &
rm -rf $TEMP_PATH

LOCAL_COMMIT=$(git rev-parse HEAD)
BRANCH=$(git branch)
echo "finished deploy - now on version $LOCAL_COMMIT"
MAIL="adrian.lupu@fullscreendigital.ro;cosmin.popa@fullscreendigital.ro;mihaigeorge.c@gmail.com"
SUBJECT="Deploy Successful - $BRANCH"
MESSAGE="$LOCAL_COMMIT"
echo "sending mail to $MAIL"
cd $WORKING_PATH
/app/nodejs/node-v8.9.4/bin/node ./deploy-scripts/deploy_mail.js "$MAIL" "$SUBJECT" "$(< $LOG)"
