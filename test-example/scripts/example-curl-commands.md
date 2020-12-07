```bash
curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/request-github -d '{ "did": "did:key:z6Mkq864iaQiS6EaY2mwoYMyuqocbB7FoCxWomZnHR78Bsoz", "username": "pi0neerpat" }'

curl http://localhost:3000/api/v0/request-github -d '{ "did": "did:key:z6MkoTZNAdoB2AXwtiFxkgrAiKxAWARUFDqHq4VrKxk9nWqd", "username": "pi0neerpat" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-github -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa2prVGFVaTd6dEVmaEMzVVhKWEpZNXVxRWIzNENiOW1yemdMczl4ZTNSVmRzI3o2TWtqa1RhVWk3enRFZmhDM1VYSlhKWTV1cUViMzRDYjltcnpnTHM5eGUzUlZkcyJ9.eyJjaGFsbGVuZ2VDb2RlIjoiOGZNTTZBTkN1RUROTDFpRWlIV0EySk5oNkJsU2RzcGkifQ.1bRJaDDZFfALstkg1NLpYCnMZcTyH1iG6YaqT6dvoPdRccdxw-ZM3NH9qejIbVw0FvAE4ayh8b8n9dE9xUQaAg" }'

curl  http://localhost:3000/api/v0/confirm-github -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa29UWk5BZG9CMkFYd3RpRnhrZ3JBaUt4QVdBUlVGRHFIcTRWckt4azluV3FkI3o2TWtvVFpOQWRvQjJBWHd0aUZ4a2dyQWlLeEFXQVJVRkRxSHE0VnJLeGs5bldxZCJ9.eyJjaGFsbGVuZ2VDb2RlIjoiN2lEMWtrc2xjN1NQeW5xVmhZMnp4WFoycUs2dHduM20ifQ.I0Usp9RdbVpKHDGz9Ht6PGkehw5yQUYz1oYjQ7_NVW0TLljZ5wE_h43547xnn-Ctk5vQtdP5IRpU4kVHhNQMCA" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/request-twitter -d '{ "did": "did:key:z6Mkq864iaQiS6EaY2mwoYMyuqocbB7FoCxWomZnHR78Bsoz", "username": "pi0neerpat" }'

curl https://r27sfer037.execute-api.us-west-2.amazonaws.com/develop/api/v0/confirm-twitter -d '{ "jws": "eyJhbGciOiJFZERTQSIsImtpZCI6ImRpZDprZXk6ejZNa3E4NjRpYVFpUzZFYVkybXdvWU15dXFvY2JCN0ZvQ3hXb21abkhSNzhCc296I3o2TWtxODY0aWFRaVM2RWFZMm13b1lNeXVxb2NiQjdGb0N4V29tWm5IUjc4QnNveiJ9.eyJjaGFsbGVuZ2VDb2RlIjoieHlJcUQ0MXl6TkRxVXNYeTNYdWpWcExTd1BlZmJrUk8ifQ.FTtcjX2p3mDw_fjA4AFiajKA5vPj1_MjXD8OafSe5Joc7JbERuNh8RYYrtzFPnkGip_xWneM-3C037uqHYlaDg" }'
```
