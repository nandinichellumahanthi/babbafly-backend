const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.babbafly-cluster.yrgglte.mongodb.net",
  (err, addresses) => {
    if (err) {
      console.error("DNS Error:", err);
    } else {
      console.log("SRV Records:", addresses);
    }
  }
);