# Nicehash automated slack notifier

### Description

Ubuntu only. Sorry Windows users.

donation: 1GNDUySAr5qhGXPKyJAFsUmYdrVoCkrgQQ

### Requirements

```
- nodejs
    > https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions
- php
    > sudo apt install php7.0
- slack messenger
    > https://slack.com/
    > require incoming webhooks: https://my.slack.com/services/new/incoming-webhook/
```

### Usage

1. git clone https://github.com/genma81/nicehash-slack-notifier.git

2. cd nicehash-slack-notifier

3. npm install

4. edit nicehash-slack-notifier/base.js
    - change wallet to your own wallet address(btc only) //line 7
    - change file path //line 178

5. edit nicehash-slack-notifier/fireslackmessage.php
    - change slack webhook api to your own

6. test run

   ```
   node base.js
   //success if output is "The file is saved"

   php fireslackmessage.php
   ```

7. open cronjobs, set job for your wanted time

   ```
   crontab -e

   //cron file
   59 * * * * cd <path>/nicehash-slack-notifier && node base.js
   0 * * * * cd <path>/nicehash-slack-notifier && php fireslackmessage.php
   ```
