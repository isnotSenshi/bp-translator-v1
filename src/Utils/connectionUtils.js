import https from 'https'

export const checkInternetConnection = () => new Promise((resolve) => {
  const req = https.request(
    { hostname: '1.1.1.1', method: 'HEAD', timeout: 3000 },
    () => { resolve(true); req.destroy() }
  )
  req.on('error', () => resolve(false))
  req.on('timeout', () => { req.destroy(); resolve(false) })
  req.end()
})
