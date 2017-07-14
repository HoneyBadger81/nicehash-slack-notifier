<?php

exec("curl -X POST -H 'Content-type: application/json' \
--data @slackmessage.json \
https://hooks.slack.com/services/XXXXXXXXX/XXXXXXXXX/XXXXXXXXXXXXXXXXXXXXXX
");
