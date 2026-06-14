const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

dns.resolveSrv(
  '_mongodb._tcp.babbafly-cluster.yrgglte.mongodb.net',
  (err, records) => {
    console.log(err || records);
  }
);