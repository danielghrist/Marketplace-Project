/*** Server to route and hash passwords for registration and allow users to login. ****/

// Require Modules:
const express = require("express");
const mysql = require("mysql");
const ejsMate = require("ejs-mate");
const app = express();
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");

// Middelware used to get data out of form data send through urlencoded:
app.use(express.urlencoded(/*{ extended: true }*/));

// Set up path for static files to be served:
app.use(express.static(path.join(__dirname, "public")));

/***** TESTING EJS *****/
/*** DELETE IF IT DOESN'T WORK ***/
// Set the view engine to EJS:
app.engine("ejs", ejsMate);
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
// db.getConnection((err, connection) => {
//   if (err) throw err;
//   console.log("DB connected successful: " + connection.threadId);
// });

// The route to GET the main index.html page:
console.log(path.join(__dirname, "index.html"));
app.get("/", (req, res) => {
  res.render("home");
  // res.sendFile(path.join(__dirname, "index.html"));
});

// Route to GET and serve shop page:
app.get("/shop", (req, res) => {
  res.render("shop");
});

app.get("/collections", async (reg, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlSearch = "SELECT * FROM testItems";

    // Trying to get data from DB:
    await connection.query(sqlSearch, async (err, result) => {
      if (err) throw err;
      else {
        results = result;
        res.render("collections/index", results);
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

/***** ISSUE IS WITH THE PORT FORWARDING BETWEEN NGINX/EXPRESS *****/
// Route to GET and serve login page:
app.get("/login", (req, res) => {
  res.render("login");
});

/***** BEGIN CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/
// Route to GET and serve register page:
app.get("/register", (req, res) => {
  res.render("register");
});

// Create User in the MySQL Database:
app.post("/register", async (req, res) => {
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

    // Check if User exists, if not add to DB:
    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        res.status(409).render("createUser", {
          user,
          text: "has already registered and exists within the database.",
        });
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Created new User");
          console.log(result.insertId);
          res
            .status(201)
            .render("createUser", { user, text: "added to database..." });
        });
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
}); //end of app.post()
/***** END CODE TO BE ABLE TO ADD ROUTE FOR REGISTRATION *****/

// 404 Middleware if no other route matches:
app.use((req, res) => {
  res.status(404).send("NOT FOUND!");
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server Started on port ${port}...`));
