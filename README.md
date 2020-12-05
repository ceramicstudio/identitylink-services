# 3box-verifications-v2

## Test

Run jest

```bash
yarn test
```

You can also test against live data. You will need a recent (<30m) Tweet & Gist containing a `did`. See https://github.com/pi0neerpat/3box-did-utils for a live data test suite and other useful scripts.

```bash
sls offline --host 0.0.0.0
```

## Deploy

```bash
sls deploy
```
