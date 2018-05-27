# tdl
tile download, again but more sophisticated hopefully

## usage
```
$ vi config/default.hjson
$ node tdl.js > out.ndjson
($ tippecanoe)
```
## example of config/default.hjson
```
{
  Z: 5
  X: 28
  Y: 12
  urls: [
    ['https://cyberjapandata.gsi.go.jp/xyz/experimental_dem5a', 18, 18]
  ]
  ext: geojson
}
```
