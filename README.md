# 3DC Metro

DC metro but it's 3D for some reason

## Getting Started

### Download Metro data

Download latest Metro station and line data from Open Data DC.

Go to [Metro Lines Regional
dataset](https://opendata.dc.gov/datasets/ead6291a71874bf8ba332d135036fbda_58/explore).

Click "Download".

Click "Download GeoJSON".

Copy downloaded file to `3dcmetro-web/src/data`.

Repeat steps above for [Metro Stations Regional
dataset](https://opendata.dc.gov/datasets/DCGIS::metro-stations-regional/explore).

### Development

```
cd 3dcmetro-web
yarn install
yarn start
```

### Build

```
cd 3dcmetro-web
yarn build
npx serve dist
```