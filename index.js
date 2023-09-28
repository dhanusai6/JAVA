const express = require("express");
const app = express();
const passwordHash = require("password-hash");
const bp = require("body-parser");

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.set("view engine", "ejs");

const admin = require("firebase-admin");
const serviceAccount = require("./key.json");

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
};

admin.initializeApp(firebaseConfig);

const db = admin.firestore();



app.get("/", function (req, res) {
  res.sendFile(__dirname + "/Home.html");
});
app.get("/signup.html", (req, res) => {
    res.sendFile(__dirname + "/signup.html");
  });
  app.get("/signin.html",(req,res)=>{
      res.sendFile(__dirname+"/signin.html");
  });


app.post("/signup", function (req, res) {
    const fullname = req.body.fullname;
    const email = req.body.email;
    const password = req.body.password;
    if (!fullname || !email || !password) {
        return res.send("Please provide all required information.");
      }
  db.collection("userDemo")
    .where("email", "==", email)
    .get()
    .then((emailDocs) => {
      if (!emailDocs.empty) {
        res.send("An account with this email already exists.");
      } else {
        db.collection("userDemo")
          .where("fullname", "==", fullname)
          .get()
          .then((fullnameDocs) => {
            if (!fullnameDocs.empty) {
              res.send("An account with this fullname already exists.");
            } else {
              const hashedPassword = passwordHash.generate(password);

              db.collection("userDemo")
                .add({
                  fullname,
                  email,
                  password: hashedPassword,
                })
                .then(() => {
                  res.sendFile(__dirname + "/signin.html");
                })
                .catch((error) => {
                  console.error("Error adding user: ", error);
                  res.send("Something went wrong");
                });
            }
          });
      }
    })
    .catch((error) => {
      console.error("Error checking for an existing user: ", error);
      res.send("Something went wrong");
    });
});




app.post("/signin", function (req, res) {
    const email = req.body.email;
    const password = req.body.password;
    console.log(password);
  
    if (!email || !password) {
      return res.send("Please provide both fullname and password.");
    }
  
    db.collection("userDemo")
      .where("email", "==", email)
      .get()
      .then((docs) => {
        if (!docs.empty) {
          const user = docs.docs[0].data();
  
          if (passwordHash.verify(password, user.password)) {
            res.sendFile(__dirname + "/index.html");
          } else {
            res.send("Authentication failed");
          }
        } else {
          res.send("User not found");
        }
      })
      .catch((error) => {
        console.error("Error searching for user: ", error);
        res.send("Something went wrong");
      });
  });
  

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});