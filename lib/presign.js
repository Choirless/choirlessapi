// libs
const crypto = require('crypto')
const moment = require('moment')

// config
const accessKey = process.env.COS_ACCESS_KEY_ID
const secretKey = process.env.COS_ACCESS_KEY_SECRET
const host = process.env.COS_ENDPOINT
const region = process.env.COS_REGION
const endpoint = 'https://' + host
const bucket = process.env.COS_DEFAULT_BUCKET
const expiration = 10 * 60 // time in seconds

// hashing and signing methods
function hash (key, msg) {
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(msg, 'utf8')
  return hmac.digest()
}
function hmacHex (key, msg) {
  const hmac = crypto.createHmac('sha256', key)
  hmac.update(msg, 'utf8')
  return hmac.digest('hex')
}
function hashHex (msg) {
  const hash = crypto.createHash('sha256')
  hash.update(msg)
  return hash.digest('hex')
}

// region is a wildcard value that takes the place of the AWS region value
// as COS doesn't use the same conventions for regions, this parameter can accept any string
function createSignatureKey (key, datestamp, region, service) {
  const keyDate = hash(('AWS4' + key), datestamp)
  const keyString = hash(keyDate, region)
  const keyService = hash(keyString, service)
  return hash(keyService, 'aws4_request')
}

// generate a presigned URL
const presign = function (method, key) {
  // assemble the standardized request
  method = method.toUpperCase()
  const time = moment().utc()
  const timestamp = time.format('YYYYMMDDTHHmmss') + 'Z'
  const datestamp = time.format('YYYYMMDD')

  const credential = encodeURIComponent(accessKey + '/' + datestamp + '/' + region + '/s3/aws4_request')
  const standardizedQuerystring = `X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=${credential}&X-Amz-Date=${timestamp}&X-Amz-Expires=${expiration.toString()}&X-Amz-SignedHeaders=host`
  const standardizedResource = '/' + bucket + '/' + key
  const payloadHash = 'UNSIGNED-PAYLOAD'
  const standardizedHeaders = 'host:' + host
  const signedHeaders = 'host'

  const standardizedRequest = method + '\n' +
      standardizedResource + '\n' +
      standardizedQuerystring + '\n' +
      standardizedHeaders + '\n' +
      '\n' +
      signedHeaders + '\n' +
      payloadHash

  // assemble string-to-sign
  const hashingAlgorithm = 'AWS4-HMAC-SHA256'
  const credentialScope = datestamp + '/' + region + '/' + 's3/aws4_request'
  const sts = hashingAlgorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hashHex(standardizedRequest)

  // generate the signature
  const signatureKey = createSignatureKey(secretKey, datestamp, region, 's3')
  const signature = hmacHex(signatureKey, sts)

  // create the URL
  return `${endpoint}/${bucket}/${key}?${standardizedQuerystring}&X-Amz-Signature=${signature}`
}

module.exports = presign
