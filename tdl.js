const config = require('config')
const fetch = require('node-fetch')

const g = function* gfn() {
  const Z = config.get('Z')
  const X = config.get('X')
  const Y = config.get('Y')
  const urls = config.get('urls')
  const ext = config.get('ext')
  for (let z = Z; z <= 18; z++) {
    const dz = z - Z
    for (let x = X * (2 ** dz); x < (X + 1) * (2 ** dz); x++) {
      for (let y = Y * (2 ** dz); y < (Y + 1) * (2 ** dz); y++) {
        for (let url of urls) {
          if (z < url[1]) continue
          if (z > url[2]) continue
          yield {url: `${url[0]}/${z}/${x}/${y}.${ext}`, z: z}
        }
      }
    }
  }
}()

const tdl = function(v) {
  if (v.done) {
  } else {
    // console.log(v.value.url)
    fetch(v.value.url)
      .then(res => res.ok ? res.json() : false)
      .then(json => {
        if (json) {
          for (const f of json.features) {
            f.tippecanoe = {
              layer: f.geometry.type.toLowerCase().replace('multi', ''),
              minzoom: v.value.z,
              maxzoom: v.value.z
            }
            console.log(JSON.stringify(f))
          }
        }
        tdl(g.next())
      }).catch(err => {
        console.error(`Failed to download ${v.value.url}. Retry.`)
        tdl(v)
      })
  }
}

for(let i = 0; i < 5; i++) {
  tdl(g.next())
}
