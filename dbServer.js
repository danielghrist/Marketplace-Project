/*** Server to route and hash passwords for registration and allow users to login. ****/

// Require Modules:
const express = require("express");
const mysql = require("mysql");
const app = express();
require("dotenv").config();

// Retrieve hidden data in .env file:
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_DATABASE = process.env.DB_DATABASE;
const DB_PORT = process.env.DB_PORT;

// Create connection to MySQL server hosted on AWS RDS:
const db = mysql.createPool({
  connectionLimit: 100,
  host: DB_HOST, //This is your localhost IP
  user: DB_USER, // "newuser" created in Step 1(e)
  password: DB_PASSWORD, // password for the new user
  database: DB_DATABASE, // Database name
  port: DB_PORT, // port name, "3306" by default
});
db.getConnection((err, connection) => {
  if (err) throw err;
  console.log("DB connected successful: " + connection.threadId);
});

// The route to GET the main index.html page:
const path = require("path");
app.use(express.static(__dirname));
console.log(path.join(__dirname, "index.html"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/***** BEGIN CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/
const bcrypt = require("bcrypt");
app.use(express.urlencoded(/*{ excluded: false }*/));
//middleware to read req.body.<params>
//CREATE USER
app.post("/register", async (req, res) => {
  const user = req.body.username;
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    // ? will be replaced by values
    // ?? will be replaced by string
    const sqlSearch = "SELECT * FROM userTable WHERE user = ?";
    const search_query = mysql.format(sqlSearch, [user]);
    const sqlInsert = "INSERT INTO userTable VALUES (0,?,?)";
    const insert_query = mysql.format(sqlInsert, [user, hashedPassword]);

    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        res.sendStatus(409);
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Created new User");
          console.log(result.insertId);
          // res.sendStatus(201);
          res.redirect("/");
        });
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
}); //end of app.post()

/***** END CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/

const port = process.env.PORT;
app.listen(port, () => console.log(`Server Started on port ${port}...`));
