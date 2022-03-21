conf = {
  network: {
    server_url: '127.0.0.1',
    server_port: 80,
    secure_server_port: 443,
    couchdb_url: '192.168.1.25',
    couchdb_port: 5984,
    server_cert_file: './certs/server.crt',
    server_key_file: './certs/server.key'
  },

  logs: {
    level: 'info',
    rotateFrequency: '1d',
    maxLogFiles: '60d',
    datePattern: 'yyyy-MM-dd',
    appLogFolder: 'appLogs',
    couchLogFolder: 'couchDBLogs',
  },

  run_as_service: true
}

module.exports = conf;
