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
    host: 'my.smtp.host',
    port: 465,
    secure: true,
    auth: {
      user: 'smtpuser@mydomain.com',
      pass: 'smtppw'
    }
  },
  mailMessageOpts: {
    to: [
      'someone@somedomain.com',
    	'someoneelse@someotherdomain.com'
    ],
    from: 'couch-proxy',
    subject: '{{level}} - from couch-proxy . . .'
  },
}

module.exports = conf;
