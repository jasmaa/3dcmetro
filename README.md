# 3DC Metro

DC metro but it's 3D for some reason

## Getting Started

Get an API key for [WMATA API](https://developer.wmata.com/demokey).

Create `.env` from `example.env` and fill in environment variables.

Get up-to-date metro data with:
```
pip install -r requirements.txt
python scripts/wmata.py
```

```
yarn install
yarn build
npx serve dist
```