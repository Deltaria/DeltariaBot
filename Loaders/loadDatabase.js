const mysql = require("mysql")

module.exports = async () => {

    let db = await mysql.createConnection({

        host: "mysql2.ouiheberg.com",
        user: "u8803_wZpHZe7E48",
        password: "OVnX@U.4C4t9!=yHMJFP.Xlx",
        database: "s8803_BDD"

    })

    return db;
}

