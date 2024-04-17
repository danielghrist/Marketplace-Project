/*** Server to route and hash passwords for registration and allow users to login. ****/

// Require Modules:
const express = require("express");
const mysql = require("mysql");
const app = express();
require("dotenv").config();
const path = require("path");

// Set up path for static files to be served:
app.use(express.static(path.join(__dirname, "public")));

/***** TESTING EJS *****/
/*** DELETE IF IT DOESN'T WORK ***/
// Set the view engine to EJS:
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
/*** DELETE IF IT DOESN'T WORK ***/

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
console.log(path.join(__dirname, "index.html"));
app.get("/", (req, res) => {
  res.render("home");
  // res.sendFile(path.join(__dirname, "index.html"));
});

/***** BEGIN TESTING ROUTES TO SEE IF ISSUE IS WITH THE PORT FORWARDING BETWEEN NGINX/EXPRESS *****/
/*** DELETE ONCE I FIGURE OUT HOW TO GET NGINX TO PLAY NICE WITH EXPRESS ***/
app.get("/createUser", (reg, res) => {
  res.send("I am here!!! SEE ME!!");
});
/*** DELETE ONCE I FIGURE OUT HOW TO GET NGINX TO PLAY NICE WITH EXPRESS ***/
/***** END TESTING ROUTES TO SEE IF ISSUE IS WITH THE PORT FORWARDING BETWEEN NGINX/EXPRESS *****/

/***** BEGIN CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/
const bcrypt = require("bcrypt");
app.use(express.urlencoded(/*{ extended: true }*/));
//middleware to read req.body.<params>
//CREATE USER
app.post("/createUser", async (req, res) => {
  /*** TESTING DELETE WHEN FIGURE OUT HOW TO GET NGINX SERVER TO PLAY NICE WITH EXPRESS ***/
  // res.send("hello I am accesible!!!");
  /*** TESTING DELETE WHEN FIGURE OUT HOW TO GET NGINX SERVER TO PLAY NICE WITH EXPRESS ***/

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

    // Check if User exists:
    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        res
          .status(409)
          .send(
            `<h1>Status ${res.statusCode}: This user has already registered and exists within the database.</h1>`
          );
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Created new User");
          console.log(result.insertId);
          res
            .status(201)
            .send(
              `<h1>Status ${res.statusCode}: User added to database...</h1>`
            );
        });
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
}); //end of app.post()
/***** END CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/

const port = process.env.PORT;
app.listen(port, () => console.log(`Server Started on port ${port}...`));
