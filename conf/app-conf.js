conf = {
  network: {
    server_url: 'my.server.url',
    secure_server_port: 443,
    couchdb_url: '127.0.0.1',
    couchdb_port: 5984,
    server_cert_file: './certs/server.crt',
    server_key_file: './certs/server.key'
  },

  logs: {
    level: 'info',              // log 'info' or worse...
    rotateFrequency: '1d',      // set to rotate daily...
    maxLogFiles: '60d',         // keep sixty days of logs...
    datePattern: 'yyyy-MM-dd',
    appLogFolder: 'appLogs',
    couchLogFolder: 'couchDBLogs',
  },

  run_as_service: true          // set this to false for command-line, true for systemd
}

module.exports = conf;
