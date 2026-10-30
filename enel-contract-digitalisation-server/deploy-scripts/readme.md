sh scripts should be copied to a different path

```sh
chmod +x deploy.sh
chmod +x gitcheck.sh

cp -r ./deploy-scripts/*.sh /app/enel-auto

crontab -e
#add the gitcheck.sh script every minute
#* * * * * /app/enel-auto/gitcheck.sh
```
