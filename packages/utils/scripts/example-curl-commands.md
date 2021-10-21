```bash
curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/request-github -d '{ "did": "did:key:z6Mkq864iaQiS6EaY2mwoYMyuqocbB7FoCxWomZnHR78Bsoz", "username": "pi0neerpat" }'

curl http://localhost:3000/api/v0/request-github -d '{ "did": "did:key:z6MkoTZNAdoB2AXwtiFxkgrAiKxAWARUFDqHq4VrKxk9nWqd", "username": "pi0neerpat" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-github -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2prVGFVaTd6dEVmaEMzVVhKWEpZNXVxRWIzNENiOW1yemdMczl4ZTNSVmRzI3o2TWtqa1RhVWk3enRFZmhDM1VYSlhKWTV1cUViMzRDYjltcnpnTHM5eGUzUlZkcyJ9.eyJjaGFsbGVuZ2VDb2RlIjoiOGZNTTZBTkN1RUROTDFpRWlIV0EySk5oNkJsU2RzcGkifQ.1bRJaDDZFfALstkg1NLpYCnMZcTyH1iG6YaqT6dvoPdRccdxw-ZM3NH9qejIbVw0FvAE4ayh8b8n9dE9xUQaAg" }'

curl  http://localhost:3000/api/v0/confirm-github -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3Y1bWc5S2hZRlc0d3ZyUDhQVlRmcVpLTDY2RXlVVnhtb3NGV2t5cWFwR0drI3o2TWt2NW1nOUtoWUZXNHd2clA4UFZUZnFaS0w2NkV5VVZ4bW9zRldreXFhcEdHayJ9.eyJjaGFsbGVuZ2VDb2RlIjoiVjZKQzc1NHJsYnRoZlZSMnpMckpOWDhwWXdldWQ3M3oifQ.WBLYfZX0T69z6DHg3J-aEh0opToNh8CfI5FxSiZfQA1e5GWPy9TQL1-uNsTOqL5vFz6fc2_gRBVpxp8NTay0CA" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/request-twitter -d '{ "did": "did:key:z6Mkq864iaQiS6EaY2mwoYMyuqocbB7FoCxWomZnHR78Bsoz", "username": "pi0neerpat" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-twitter -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3E4NjRpYVFpUzZFYVkybXdvWU15dXFvY2JCN0ZvQ3hXb21abkhSNzhCc296I3o2TWtxODY0aWFRaVM2RWFZMm13b1lNeXVxb2NiQjdGb0N4V29tWm5IUjc4QnNveiJ9.eyJjaGFsbGVuZ2VDb2RlIjoieHlJcUQ0MXl6TkRxVXNYeTNYdWpWcExTd1BlZmJrUk8ifQ.FTtcjX2p3mDw_fjA4AFiajKA5vPj1_MjXD8OafSe5Joc7JbERuNh8RYYrtzFPnkGip_xWneM-3C037uqHYlaDg" }'

curl http://localhost:3000/api/v0/confirm-discord -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3Y1bWc5S2hZRlc0d3ZyUDhQVlRmcVpLTDY2RXlVVnhtb3NGV2t5cWFwR0drI3o2TWt2NW1nOUtoWUZXNHd2clA4UFZUZnFaS0w2NkV5VVZ4bW9zRldreXFhcEdHayJ9.eyJjaGFsbGVuZ2VDb2RlIjoiVjZKQzc1NHJsYnRoZlZSMnpMckpOWDhwWXdldWQ3M3oifQ.WBLYfZX0T69z6DHg3J-aEh0opToNh8CfI5FxSiZfQA1e5GWPy9TQL1-uNsTOqL5vFz6fc2_gRBVpxp8NTay0CA" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-discord -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2dOYVVpdGtER1hrY2ZoNG1LNDZta3FQZG5Cd0RaM2p2bUdlRnR5V3V2c21vI3o2TWtnTmFVaXRrREdYa2NmaDRtSzQ2bWtxUGRuQndEWjNqdm1HZUZ0eVd1dnNtbyJ9.eyJjaGFsbGVuZ2VDb2RlIjoiR01DcHQwUHNiOUM3ak1pekdrMHF5SmpvVmhqeHhQbEIifQ.IJFVVwZlO0ClNcwDNmc-tYxxZQoJHnZeWZ7QtX8RPR1MoB6e2P89fyqNutAVKAmNIILm6xvTFnrj1SjJKuc6BA" }'

curl http://localhost:3000/api/v0/confirm-telegram -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2dOYVVpdGtER1hrY2ZoNG1LNDZta3FQZG5Cd0RaM2p2bUdlRnR5V3V2c21vI3o2TWtnTmFVaXRrREdYa2NmaDRtSzQ2bWtxUGRuQndEWjNqdm1HZUZ0eVd1dnNtbyJ9.eyJjaGFsbGVuZ2VDb2RlIjoiR01DcHQwUHNiOUM3ak1pekdrMHF5SmpvVmhqeHhQbEIifQ.IJFVVwZlO0ClNcwDNmc-tYxxZQoJHnZeWZ7QtX8RPR1MoB6e2P89fyqNutAVKAmNIILm6xvTFnrj1SjJKuc6BA" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-telegram -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2dOYVVpdGtER1hrY2ZoNG1LNDZta3FQZG5Cd0RaM2p2bUdlRnR5V3V2c21vI3o2TWtnTmFVaXRrREdYa2NmaDRtSzQ2bWtxUGRuQndEWjNqdm1HZUZ0eVd1dnNtbyJ9.eyJjaGFsbGVuZ2VDb2RlIjoiR01DcHQwUHNiOUM3ak1pekdrMHF5SmpvVmhqeHhQbEIifQ.IJFVVwZlO0ClNcwDNmc-tYxxZQoJHnZeWZ7QtX8RPR1MoB6e2P89fyqNutAVKAmNIILm6xvTFnrj1SjJKuc6BA" }'
```
