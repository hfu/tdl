const config = require('config')
const fetch = require('node-fetch')

const g = function* gfn() {
  const Z = config.get('Z')
  const X = config.get('X')
  const Y = config.get('Y')
  const urls = config.get('urls')
  const ext = config.get('ext')
  const order = config.get('order')
  for (let z = Z; z <= 18; z++) {
    const dz = z - Z
    for (let x = X * (2 ** dz); x < (X + 1) * (2 ** dz); x++) {
      for (let y = Y * (2 ** dz); y < (Y + 1) * (2 ** dz); y++) {
        for (let url of urls) {
          if (z < url[1]) continue
          if (z > url[2]) continue
          if (order === 'zyx') {
            yield {
              url: `${url[0]}/${z}/${y}/${x}.${ext}`, 
              z: z, x: x, y: y, ext: ext, ttl: 5}
          } else {
            yield {
              url: `${url[0]}/${z}/${x}/${y}.${ext}`, 
              z: z, x: x, y: y, ext: ext, ttl: 5}
          }
        }
      }
    }
  }
}()

const tdl = function(v) {
  if (v.done) {
  } else {
    // console.error(v.value.url)
    switch (v.value.ext) {
    case 'geojson':
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
          v.value.ttl--
          console.error(`Failed to download ${v.value.url}. Retry (${v.value.ttl}).`)
          if (v.value.ttl > 0) {
            tdl(v)
          } else {
            tdl(g.next())
          }
        })
      break
    case 'pbf':
      fetch(v.value.url)
        .then(res => {
          if (!res.ok) return false
          if (res.headers.get('content-encoding') === 'gzip') {
            return res.buffer() 
          } else {
            throw new Error('plain binary not supported yet.')
          }
        })
        .then(buf => {
          console.log(JSON.stringify({
            z: v.value.z, x: v.value.x, y: v.value.y, buffer: buf.toString('base64')
          }))
          tdl(g.next())
        }).catch(err => {
          v.value.ttl--
          console.error(`Failed to download ${v.value.url}. Retry (${v.value.ttl}).`)
          if (v.value.ttl > 0) {
            tdl(v)
          } else {
            tdl(g.next())
          }
        })
      break
    }
  }
}

for(let i = 0; i < 5; i++) {
  tdl(g.next())
}
