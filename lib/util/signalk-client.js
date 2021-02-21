/**
 * Minimal Signal K client for websocket and fetch query
 * Inspired by https://github.com/SignalK/signalk-js-client from Fabian Tollenaar <fabian@decipher.industries>
 */
import EventEmitter from 'eventemitter3'
import Debug from 'debug'

const debug = Debug('instrumentpanel:signalk-client')

export default class SkClient extends EventEmitter {
  constructor (options = {}) {
    super()
    this.options = {
      hostname: 'localhost',
      port: 3000,
      useTLS: true,
      useAuthentication: false,
      notifications: true,
      version: 'v1',
      autoConnect: false,
      reconnect: true,
      maxRetries: 100,
      username: null,
      password: null,
      ...options
    }
    this.httpURI = this.buildURI('http')
    this.wsURI = this.buildURI('ws')
    this.shouldDisconnect = false
    this.connected = false
    this.socket = null
    this.lastMessage = -1
    this.isConnecting = false
    
    this._fetchReady = false
    this._bearerTokenPrefix = this.options.bearerTokenPrefix || 'Bearer'
    this._authenticated = false
    this._retries = 0
    this._connection = null

    this.onWSMessage = this._onWSMessage.bind(this)
    this.onWSOpen = this._onWSOpen.bind(this)
    this.onWSClose = this._onWSClose.bind(this)
    this.onWSError = this._onWSError.bind(this)

    this._token = {
      kind: '',
      token: ''
    }
  }

  set (key, value) {
    this.options[key] = value
    return this
  }

  get (key) {
    return this.options[key] || null
  }

  set connectionInfo (data) {
    debug(`[set connectionInfo] data=${JSON.stringify(data)}`)
    this._connection = data
    if (data !== null) {
      this.emit('connectionInfo', data)
    }
  }

  get connectionInfo () {
    return this._connection
  }

  buildURI (protocol) {
    let uri = this.options.useTLS === true ? `${protocol}s://` : `${protocol}://`
    uri += this.options.hostname
    uri += this.options.port === 80 ? '' : `:${this.options.port}`

    uri += '/signalk/'
    uri += this.options.version

    if (protocol === 'ws') {
      uri += '/stream?sendMeta=all'
    }

    if (protocol === 'http') {
      uri += '/api'
    }

    return uri
  }

  state () {
    return {
      connecting: this.isConnecting,
      connected: this.connected,
      ready: this.fetchReady
    }
  }

  disconnect () {
    debug('[disconnect] called')
    this.shouldDisconnect = true
    this.reconnect()
  }

  connect () {
    this.reconnect()
  }

  reconnect () {
    this.connectionInfo = null;
    if (this.isConnecting === true) {
      return
    }

    if (this.socket !== null) {
      debug('[reconnect] closing socket')
      this.socket.close()
      return
    }

    if ((this.options.maxRetries > 0) && (this._retries >= this.options.maxRetries)) {
      this.emit('hitMaxRetries')
      this.cleanupListeners()
      return
    }

    if (this._retries > 0) {
      this.emit('retries', this._retries)
    }

    if (this.options.reconnect === false) {
      debug('[reconnect] Not reconnecting, for reconnect is false')
      this.cleanupListeners()
      return
    }

    if (this.shouldDisconnect === true) {
      debug('[reconnect] not reconnecting, shouldDisconnect is true')
      this.cleanupListeners()
      return
    }

    debug(`[reconnect] socket is ${this.socket === null ? '' : 'not '}NULL`)

    this._fetchReady = false
    this.shouldDisconnect = false
    this.isConnecting = true

    if (this.options.useAuthentication === false) {
      this._fetchReady = true
      this.emit('fetchReady')
      this.initiateSocket()
      return
    }

    const authRequest = {
      method: 'POST',
      mode: 'cors',
      credentials: 'same-origin',
      body: JSON.stringify({
        username: String(this.options.username || ''),
        password: String(this.options.password || '')
      })
    }

    return this.fetch('/auth/login', authRequest)
      .then(result => {
        if (!result || typeof result !== 'object' || !result.hasOwnProperty('token')) {
          throw new Error(`Unexpected response from auth endpoint: ${JSON.stringify(result)}`)
        }

        debug(`[reconnect] successful auth request: ${JSON.stringify(result, null, 2)}`)
     
        this._authenticated = true
        this._token = {
          kind: (typeof result.type === 'string' && result.type.trim() !== '') ? result.type : this._bearerTokenPrefix,
          token: result.token
        }

        this._fetchReady = true
        this.emit('fetchReady')
        this.initiateSocket()
      })
      .catch(err => {
        debug(`[reconnect] error logging in: ${err.message}, reconnecting`)
        this.emit('error', err)
        this._retries += 1
        this.isConnecting = false
        return this.reconnect()
      })
  }

  setAuthenticated (token, kind = 'JWT') { // @FIXME default type should be Bearer
    this.emit('fetchReady')
    this._authenticated = true
    this._token = {
      kind,
      token
    }
  }

  initiateSocket () {
    debug(`[initiateSocket] retry counter: ${this._retries}/${this.options.maxRetries}`)
    this.socket = new WebSocket(this.wsURI)
    this.socket.addEventListener('message', this.onWSMessage)
    this.socket.addEventListener('open', this.onWSOpen)
    this.socket.addEventListener('error', this.onWSError)
    this.socket.addEventListener('close', this.onWSClose)
  }

  cleanupListeners () {
    debug(`[cleanupListeners] resetting auth and removing listeners`)
    // Reset authentication
    this._authenticated = false
    this._token = {
      kind: '',
      token: ''
    }
    this.removeAllListeners()
  }

  _onWSMessage (evt) {
    this.lastMessage = Date.now()
    let data = evt.data

    try {
      if (typeof data === 'string') {
        data = JSON.parse(data)
      }
    } catch (e) {
      console.log(`[Connection: ${this.options.hostname}] Error parsing data: ${e.message}`)
    }

    if (this.connectionInfo === null) {
      if (data && typeof data === 'object' && data.hasOwnProperty('name') && data.hasOwnProperty('version') && data.hasOwnProperty('roles')) {
        this.connectionInfo = data
      }
    }
    this.emit('delta', data)
  }

  _onWSOpen () {
    debug('[_onWSOpen] called with wsURI:', this.wsURI)
    this._connection = null
    this.connected = true
    this.isConnecting = false
    this._retries = 0
    this.emit('connect')
  }

  _onWSError (err) {
    debug('[_onWSError] WS error', err.message || '')
    this._connection = null
    this._retries += 1
    this.emit('error', err)
    this.reconnect()
  }

  _onWSClose (evt) {
    debug('[_onWSClose] called with wsURI:', this.wsURI)
    this.socket.removeEventListener('message', this.onWSMessage)
    this.socket.removeEventListener('open', this.onWSOpen)
    this.socket.removeEventListener('error', this.onWSError)
    this.socket.removeEventListener('close', this.onWSClose)

    this.connected = false
    this.isConnecting = false
    this.socket = null
    this._connection = null

    this.emit('disconnect', evt)
    this.reconnect()
  }

  subscribe (subscribeCmd) {
    return this.send(subscribeCmd)
  }

  send (data) {
    if (this.connected !== true || this.socket === null) {
      return Promise.reject(new Error('Not connected to WebSocket'))
    }

    // Basic check if data is stringified JSON
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data)
      } catch (e) {
        debug(`[send] data is string but not valid JSON: ${e.message}`)
      }
    }

    const isObj = (data && typeof data === 'object')

    // FIXME: this shouldn't be required as per discussion about security.
    // Add token to data IF authenticated
    // https://signalk.org/specification/1.3.0/doc/security.html#other-clients
    // if (isObj && this.useAuthentication === true && this._authenticated === true) {
    //   data.token = String(this._token.token)
    // }

    try {
      if (isObj) {
        data = JSON.stringify(data)
      }
    } catch (e) {
      return Promise.reject(e)
    }

    debug(`Sending data to socket: ${data}`)
    const result = this.socket.send(data)
    return Promise.resolve(result)
  }

  fetch (path, opts) {
    if (path.charAt(0) !== '/') {
      path = `/${path}`
    }

    if (!opts || typeof opts !== 'object') {
      opts = {
        method: 'GET'
      }
    }

    if (!opts.headers || typeof opts.headers !== 'object') {
      opts.headers = {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }

    if (this._authenticated === true && !path.includes('auth/login')) {
      opts.headers = {
        ...opts.headers,
        Authorization: `${this._token.kind} ${this._token.token}`
      }

      opts.credentials = 'same-origin'
      opts.mode = 'cors'

      debug(`[fetch] enriching fetch options with in-memory token`)
    }

    let URI = `${this.httpURI}${path}`

    // @TODO httpURI includes /api, which is not desirable. Need to refactor
    if (URI.includes('/api/auth/login')) {
      URI = URI.replace('/api/auth/login', '/auth/login')
    }

    // @TODO httpURI includes /api, which is not desirable. Need to refactor
    if (URI.includes('/api/access/requests')) {
      URI = URI.replace('/api/access/requests', '/access/requests')
    }

    // @FIXME weird hack because node server paths for access requests are not standardised
    if (URI.includes('/signalk/v1/api/security')) {
      URI = URI.replace('/signalk/v1/api/security', '/security')
    }

    if (URI.includes('/signalk/v1/api/applicationData')) {
      URI = URI.replace('/signalk/v1/api/applicationData', '/signalk/v1/applicationData')
    }

    if (URI.includes('/signalk/v1/api/loginStatus')) {
      URI = URI.replace('/signalk/v1/api/loginStatus', '/loginStatus')
    }

    debug(`[fetch] ${opts.method || 'GET'} ${URI} ${JSON.stringify(opts, null, 2)}`)
    return fetch(URI, opts)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error fetching ${URI}: ${response.status} ${response.statusText}`)
        }

        const type = response.headers.get('content-type')

        if (type && type.includes('application/json')) {
          return response.json()
        }

        return response.text()
      })
  }
}
