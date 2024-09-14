# web-v2

Web frontend V2

## Getting Started

### Download Metro data

Download latest Metro station and line data from Open Data DC.

Go to [Metro Lines Regional
dataset](https://opendata.dc.gov/datasets/ead6291a71874bf8ba332d135036fbda_58/explore).

Click "Download".

Click "Download GeoJSON".

Copy downloaded file to `src/data`.

Change the file extension of the file from `.geojson` to `.json`.

Repeat steps above for [Metro Stations Regional
dataset](https://opendata.dc.gov/datasets/DCGIS::metro-stations-regional/explore).


### Development

Create `.env` from `sample.env`.

```
yarn install
yarn dev
```

### Build

```
yarn build
npx serve dist
```