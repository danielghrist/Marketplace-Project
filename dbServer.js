/*** Server to route and hash passwords for registration and allow users to login. ****/

// Require Modules:
const express = require("express");
const mysql = require("mysql");
const ejsMate = require("ejs-mate");
const app = express();
require("dotenv").config();
const path = require("path");
const bcrypt = require("bcrypt");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const fileUpload = require("express-fileupload");
const { connect } = require("http2");

// Ovveried POST request with "?_method=DELETE" to be able to send PUT/PATCH/DELETE requests using:
// Middleware
app.use(methodOverride("_method"));

// Middelware used to get data out of form data send through urlencoded:
app.use(express.urlencoded(/*{ extended: true }*/));
app.use(express.json());

// Set up path for static files to be served:
app.use(express.static(path.join(__dirname, "public")));

// Set the view engine to EJS:
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

// Session middle-ware, express-session for keeping track of things via encoded cookie data:
const sessionOptions = {
  secret: "thisisnotagoodsecret",
  resave: false,
  saveUninitialized: false, // Doesn't save new, but unmodified sessions.
  cookie: {
    httpOnly: true, // From the documentation
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // Date.now() returns time in milliseconds
    maxAge: 1000 * 60 * 60 * 24 * 7, // This is one week 1 sec * 60 secs/min * 60 min/hr * 24 hr/day * 7 days/week
  },
};
app.use(session(sessionOptions));

// Middle-ware function to require User is logged in:
const isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be logged in.");
    return res.redirect("/login");
  }
  next();
};

// Middle-ware function to check if User as admin priviledges:
const isAdmin = (req, res, next) => {
  if (req.session.user.user !== "danny") {
    // req.session.returnTo = req.originalUrl;
    req.flash("error", "You do not have acccess to view this page.");
    return res.redirect("/");
  }
  next();
};

// Middle-ware module to allow messages to be sent through redirects so we can have alerts:
app.use(flash());

app.use(fileUpload());

// Middle-ware which makes variables available to all templates and routes. Sets flash alerts and session user:
app.use((req, res, next) => {
  // res.locals.userId = req.session.user_id;
  res.locals.currentUser = req.session.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

/**********************************************************************************/
// TODO: MOVE ALL THE DB STUFF TO NEW FILE WHEN REFACTORING JUST GOTTA GET WORKING NOW
/***** BEGIN CREATE DB CONNECTIONS & SQL QUERIES TO BE MOVED TO DB FILE LATER *****/
/**********************************************************************************/
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
/*************************************************************************/
/***** END CREATE DB POOL & SQL QUERIES TO BE MOVED TO DB FILE LATER *****/
/*************************************************************************/

// The route to GET the main index.html page:
console.log(path.join(__dirname, "index.html"));
app.get("/", (req, res) => {
  res.render("home");
  // res.sendFile(path.join(__dirname, "index.html"));
});

// WORKING, BUT I CAN'T GET IMAGE NAME TO SEND TO OTHER ROUTES
// Route to upload files using express-fileupload:
// app.post("/upload", isLoggedIn, (req, res) => {
//   if (!req.files) {
//     return res.status(400).send("No files were uploaded");
//   }
//   const file = req.files.uploadImg;
//   const path = __dirname + "/public/assets/img/" + file.name;

//   file.mv(path, (err) => {
//     if (err) {
//       return res.status(500).send(err);
//     }

//     req.flash("success", `Successfully uploaded image ${file.name}.`);
//     res.redirect("/collections/new");
//   });
// });

// Route to upload files using express-fileupload for Collections Edit page:
app.post("/uploadCollections/:id", isLoggedIn, (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded");
  }
  const { id } = req.params;
  console.log("id before: ", id);
  const file = req.files.uploadImg;
  const path = __dirname + "/public/assets/img/" + file.name;

  file.mv(path, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    console.log("id after: ", id);
    const sqlQuery = `UPDATE testItems SET Item_Img_Name = ? WHERE Item_ID = ?`;

    // Trying to get data from DB:
    db.query(sqlQuery, [file.name, id], async (err, result) => {
      if (err) throw err;
      else {
        // connection.release();
        console.log(result);
        req.flash("success", `Successfully edited image "${file.name}".`);
        res.redirect(`/collections/${id}/edit`);
      }
    });
  });
});

// Route to upload files using express-fileupload for Selling items Edit page:
app.post("/uploadSelling/:id", isLoggedIn, (req, res) => {
  if (!req.files) {
    return res.status(400).send("No files were uploaded");
  }
  const { id } = req.params;
  console.log("id before: ", id);
  const file = req.files.uploadImg;
  const path = __dirname + "/public/assets/img/" + file.name;

  file.mv(path, (err) => {
    if (err) {
      return res.status(500).send(err);
    }

    console.log("id after: ", id);
    const sqlQuery = `UPDATE testProducts SET Product_Img_Name = ? WHERE Product_ID = ?`;

    // Trying to get data from DB:
    db.query(sqlQuery, [file.name, id], async (err, result) => {
      if (err) throw err;
      else {
        // connection.release();
        console.log(result);
        req.flash("success", `Successfully edited image "${file.name}".`);
        res.redirect(`/selling/${id}/edit`);
      }
    });
  });
});

/***************************************/
/***** BEGIN SHOP/PRODUCTS ROUTES: *****/
/***************************************/
// Route to GET and serve shop/index page:
app.get("/products", async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlQuery = "SELECT * FROM testProducts";

    // Trying to get data from DB:
    await connection.query(sqlQuery, async (err, result) => {
      if (err) throw err;
      else {
        results = result;
        connection.release();
        res.render("products/shop", results);
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to GET and serve single item show page:
app.get("/products/:id", async (req, res) => {
  // TODO: ADD FUNCTIONALITY TO THIS ROUTE.
  res.render("products/show");
});

// Route to DELETE product from Products page and DB:
app.delete("/products/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = " DELETE FROM testProducts WHERE Product_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        connection.release();
        req.flash("success", "Successfully deleted product.");
        res.redirect("/products");
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});
/*************************************/
/***** END SHOP/PRODUCTS ROUTES: *****/
/*************************************/

/*********************************/
/***** BEGIN SELLING ROUTES: *****/
/*********************************/
// Route to GET and serve Selling/index page:
app.get("/selling", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlQuery = "SELECT * FROM testProducts WHERE User_ID = ?";

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [req.session.user.userId],
      async (err, result) => {
        if (err) throw err;
        else {
          results = result;
          connection.release();
          res.render("selling/index", results);
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to GET and serve single item show page:
// app.get("/products/:id", async (req, res) => {
//   // TODO: ADD FUNCTIONALITY TO THIS ROUTE.
//   res.render("products/show");
// });

// Route to DELETE product from Selling page and DB:
app.delete("/selling/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = " DELETE FROM testProducts WHERE Product_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        connection.release();
        req.flash("success", "Successfully deleted product.");
        res.redirect("/selling");
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to go to Update/Edit Selling page with values pre-filled:
app.get("/selling/:id/edit", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = "SELECT * FROM testProducts WHERE Product_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        results = result;
        connection.release();
        res.render("selling/edit", results[0]);
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to UPDATE/PUT or change/edit data for the current Selling item:
app.put("/selling/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const item = req.body.item;
    const { id } = req.params;
    console.log(item);
    const sqlQuery = `UPDATE testProducts SET Product_Category = ?, Product_Name = ?, Product_Description = ?, Product_Condition = ?, Product_Price = ? WHERE Product_ID = ?`;

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [
        item.category,
        // item.img,
        item.name,
        item.desc,
        item.condition,
        item.sellPrice,
        id,
      ],
      async (err, result) => {
        if (err) throw err;
        else {
          connection.release();
          req.flash("success", `Successfully edited "${item.name}".`);
          res.redirect("/selling");
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to go to new form to create new Selling item:
app.get("/selling/new", isLoggedIn, (req, res) => {
  res.render("selling/new");
});

// Route to Create new item in Selling:
app.post("/selling", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const item = req.body.item;
    console.log(item);
    const sqlQuery =
      " INSERT INTO testProducts VALUES(0, ?, ?, ?, ?, ?, ?, ?, ?)";

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [
        req.session.user.user,
        item.category,
        item.img,
        item.name,
        item.desc,
        item.condition,
        item.sellPrice,
        req.session.user.userId,
      ],
      async (err, result) => {
        if (err) throw err;
        else {
          connection.release();
          req.flash("success", "Successfully created a new item for sale.");
          res.redirect("/selling");
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});
/*******************************/
/***** END SELLING ROUTES: *****/
/*******************************/

/***************************************/
/***** BEGIN SHOPPING CART ROUTES: *****/
/***************************************/
// Route to GET and serve Shopping Cart/index page:
app.get("/shoppingCart", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlQuery =
      "SELECT * FROM shoppingTable INNER JOIN testProducts ON testProducts.Product_ID=shoppingTable.Item_ID WHERE shoppingTable.User_ID = ?";

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [req.session.user.userId],
      async (err, result) => {
        if (err) throw err;
        else {
          results = result;
          connection.release();
          res.render("shoppingCart/index", results);
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to DELETE product from Shopping Cart and DB:
app.delete("/shoppingCart/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = " DELETE FROM shoppingTable WHERE Item_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        connection.release();
        req.flash("success", "Successfully removed item from shopping cart.");
        res.redirect("/shoppingCart");
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to add new item to Shopping Cart:
app.post("/shoppingCart/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlSearch = "SELECT * FROM shoppingTable WHERE Item_ID = ?";
    const sqlInsert = "INSERT INTO shoppingTable VALUES (0, ?, ?)";

    // Trying to get data from DB and test if item already exists in cart:
    await connection.query(sqlSearch, [id], async (err, result) => {
      if (err) throw err;

      if (result.length != 0) {
        connection.release();
        req.flash("error", "You have already added this item to your cart.");
        res.redirect("/products");
      } else {
        await connection.query(
          sqlInsert,
          [id, req.session.user.userId],
          async (err, result) => {
            if (err) throw err;
            console.log("SHOPPING CART RESULTS", result);
            connection.release();
            req.flash("success", "Successfully Added item to cart.");
            res.redirect("/products");
          }
        );
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});
/*************************************/
/***** END SHOPPING CART ROUTES: *****/
/*************************************/

/*************************************/
/***** BEGIN COLLECTIONS ROUTES: *****/
/*************************************/
// Route to GET and serve entire Collection page:
app.get("/collections", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const sqlQuery = "SELECT * FROM testItems WHERE User_ID = ?";

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [req.session.user.userId],
      async (err, result) => {
        if (err) throw err;
        else {
          results = result;
          connection.release();
          res.render("collections/index", results);
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to DELETE item from Collections page and DB:
app.delete("/collections/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = "DELETE FROM testItems WHERE Item_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        connection.release();
        req.flash("success", "Successfully deleted collection item.");
        res.redirect("/collections");
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to go to Update/Edit Collection page with values pre-filled:
app.get("/collections/:id/edit", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const { id } = req.params;
    const sqlQuery = "SELECT * FROM testItems WHERE Item_ID = ?";

    // Trying to get data from DB:
    await connection.query(sqlQuery, [id], async (err, result) => {
      if (err) throw err;
      else {
        results = result;
        connection.release();
        res.render("collections/edit", results[0]);
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to UPDATE/PUT or change/edit data for the current Collection item:
app.put("/collections/:id", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;

    const item = req.body.item;
    const { id } = req.params;
    console.log(item);
    const sqlQuery = `UPDATE testItems SET Item_Name = ?, Item_Description = ?, Item_Purch_Date = ?, Item_Purch_Price = ? WHERE Item_ID = ?`;

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [item.name, item.desc, item.purchDate, item.purchPrice, id],
      async (err, result) => {
        if (err) throw err;
        else {
          connection.release();
          req.flash("success", `Successfully edited "${item.name}".`);
          res.redirect("/collections");
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});

// Route to go to new form to create new Collection item:
app.get("/collections/new", isLoggedIn, (req, res) => {
  res.render("collections/new");
});

// Route to Create new item in Collection:
app.post("/collections", isLoggedIn, async (req, res) => {
  db.getConnection(async (err, connection) => {
    if (err) throw err;
    const item = req.body.item;
    console.log("item object from adding new item: ", item);
    const sqlQuery = "INSERT INTO testItems VALUES(0, ?, ?, ?, ?, ?, ?)";

    // Trying to get data from DB:
    await connection.query(
      sqlQuery,
      [
        item.img,
        item.name,
        item.desc,
        item.purchDate,
        item.purchPrice,
        req.session.user.userId,
      ],
      async (err, result) => {
        if (err) throw err;
        else {
          connection.release();
          req.flash("success", `Successfully created item "${item.name}".`);
          res.redirect("/collections");
        }
      }
    ); //end of connection.query()
  }); //end of db.getConnection()
});
/***********************************/
/***** END COLLECTIONS ROUTES: *****/
/***********************************/

/***** ISSUE IS WITH THE PORT FORWARDING BETWEEN NGINX/EXPRESS *****/
/**************************************************/
/***** BEGIN CODE FOR ROUTES FOR REGISTRATION *****/
/**************************************************/
// Route to GET and serve register page:
app.get("/register", (req, res) => {
  res.render("register");
});

// Create User in the MySQL Database:
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

    // Check if User exists, if not add to DB:
    await connection.query(search_query, async (err, result) => {
      if (err) throw err;
      console.log("------> Search Results");
      console.log(result.length);
      if (result.length != 0) {
        connection.release();
        console.log("------> User already exists");
        req.flash(
          "error",
          "The user you are attempting to register already exists, please login."
        );
        res.status(409).redirect("/login");
      } else {
        await connection.query(insert_query, (err, result) => {
          connection.release();
          if (err) throw err;
          console.log("--------> Created new User");
          console.log("result.insertID: ", result.insertId);
          console.log("reslt: ", result);
          db.query(
            "SELECT * FROM userTable WHERE user = ?",
            [user],
            async (err, result) => {
              if (err) throw err;
              req.session.user = result[0];
              console.log("Session: ", req.session.user);
              req.flash(
                "success",
                `Successfully registered user ${req.session.user.user} and logged in.`
              );
              return res.status(201).redirect("/");
            }
          );
        });
      }
    }); //end of connection.query()
  }); //end of db.getConnection()
}); //end of app.post()
/********************************************/
/***** END CODE FOR REGISTRATION ROUTES *****/
/********************************************/

// Route to GET and serve login page:
app.get("/login", (req, res) => {
  res.render("login");
});

// Route to Authenticate User Login Credentials and save to session:
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM userTable WHERE user = ?",
    [username],
    async (err, result) => {
      if (err) throw err;
      console.log("result: ", result);
      if (!result[0]) {
        req.flash("error", "Invalid Login Credentials, Please Try Again.");
        res.redirect("/login");
      } else {
        const validPassword = await bcrypt.compare(
          password,
          result[0].password
        );

        if (validPassword) {
          console.log(result, result[0]);
          // req.session.user_id = result[0].userId;
          req.session.user = result[0];
          console.log("req.sesssion: ", req.session);
          req.flash(
            "success",
            `${req.session.user.user} Successfully Logged In.`
          );
          const redirectUrl = req.session.returnTo || "/";
          delete req.session.returnTo;
          res.redirect(redirectUrl);
        } else {
          console.log("req.sesssion: ", req.session);
          req.flash("error", "Invalid Login Credentials, Please Try Again.");
          res.redirect("/login");
        }
      }
    }
  );
});

app.post("/logout", (req, res) => {
  // req.session.user_id = null;
  req.session.user = null;
  req.flash("success", "You have been successfully logged out.");
  res.redirect("/");
});

app.get("/admin", isLoggedIn, isAdmin, (req, res) => {
  db.query("SELECT * FROM userTable", async (err, result) => {
    if (err) throw err;
    // console.log("result: ", result);
    if (!result) {
      console.log("NO USERS!!!!");
    } else {
      results = result;
      // req.flash("error", "Invalid Login Credentials, Please Try Again.");
      res.render("admin", results);
    }
  });
});

// 404 Middleware if no other route matches:
app.use((req, res) => {
  res.status(404).render("notFound", {
    status: res.statusCode,
    text: "PAGE NOT FOUND!",
  });
});

const port = process.env.PORT;
app.listen(port, () => console.log(`Server Started on port ${port}...`));
