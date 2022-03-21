conf = {
  fileTranportOpts: {
    level: 'info',
    appFilename: `/logs/appLogs/%DATE%-app.log`,
    couchFilename: `/logs/couchLogs/%DATE%-couch.log`,
    frequency: '1d',
    datePattern: 'yyyy-MM-DD',
    handleExceptions: true,
    maxSize: '10m',
    maxFiles: 60

  },
  mailTransportOpts: {
    host: 'smtp.dreamhost.com',
    port: 465,
    secure: true,
    auth: {
      user: 'cliff@hawkrdg.com',
      pass: 'hawkrdg.com'
    }
  },
  mailMessageOpts: {
    to: [
      'cliff@hawkrdg.com',
      // 'jpurnell@mullinsgroup.com'
    ],
    from: 'couch-proxy',
    subject: '{{level}} - from couch-proxy@hawkridge.main . . .'
  },
  mailOpts: {
    host: 'smtp.dreamhost.com',
    port: 465,
    ssl: true,
    username: 'cliff@hawkrdg.com',
    password: 'hawkrdg.com',
    to: 'cliff@hawkrdg.com, cliffsmith53581@gmail.com',
    from: 'couch-proxy-server',
    subject: '{{level}} - hawkridge.main . . .'
  }

}

module.exports = conf;
