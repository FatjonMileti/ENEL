#!/bin/bash
. $HOME/.bashrc

WORKING_PATH=/app/enel
FLAG=/app/enel-deploy-progress-flag
RUN_DEPLOY=/app/enel-auto/deploy.sh
LOG=/app/enel-auto/log

if [ -f $FLAG ]; then
  echo deploy already in progress
  exit 1
fi

cd $WORKING_PATH
git fetch

LOCAL_COMMIT=$(git rev-parse HEAD)
REMOTE_COMMIT=$(git rev-parse @{u})

echo local commit - $LOCAL_COMMIT
echo remote commit - $REMOTE_COMMIT

if [ "$LOCAL_COMMIT" = "$REMOTE_COMMIT" ];
then
  echo no need to update
else
  echo deploying...
  rm $LOG
  touch $FLAG
  $RUN_DEPLOY 2>&1 | tee $LOG
  rm $FLAG
fi
