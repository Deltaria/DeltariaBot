const mysql = require("mysql")

module.exports = async () => {

    let db = await mysql.createConnection({

        host: "mysql4.ouiheberg.com",
        user: "u9170_ayazXIK3nC",
        password: "oxtc3L!yv98CBzM.icKxw+a3",
        database: "s9170_deltaria_bot"

    })

    return db;
}

