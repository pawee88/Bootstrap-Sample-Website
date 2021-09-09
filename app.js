const express = require("express");
const bodyParser = require("body-parser");
const { urlencoded } = require("express");
const request = require("request");
const https = require("https");
const exphbs = require("express-handlebars");
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("process");
const { prototype } = require("nodemailer/lib/dkim");
require('dotenv').config();



const app = express();

const PORT = process.env.PORT || 3000

app.use(express.static("public"));

//View engine setup

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

//Body Parser Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.get("/", function (req, res) {
    res.render('contact');
});


//Contact form

app.post('/send', function (req, res) {
    const output = `
     <p>You have a new contact request</p>
     <h3>Contact Details</h3>
     <ul>
     <li>Name: ${req.body.name}</li>
     <li>Email: ${req.body.email}</li>
     <li>Phone: ${req.body.phone}</li>
     
     
     </ul>
     <h3>Message</h3>
     <p>${req.body.message}</p>

    
    `;

    // create reusable transporter object using the default SMTP transport
    const emailPassword = process.env.PASSWORD
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'techproweb.dev@gmail.com', // generated ethereal user
            pass: emailPassword, // generated ethereal password
        },

        tls: {
            rejectUnauthorized: false
        }
    });


    let mailOptions = {
        from: 'NodeMailer Contact <techproweb.dev@gmail.com>', // sender address
        to: "techproecom@gmail.com", // list of receivers
        subject: "Node Contact Form Request", // Subject line
        text: "Hello world?", // plain text body
        html: output
    };

    transporter.sendMail(mailOptions, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send("Something went wrong.");
        } else {
            res.sendFile(__dirname + "/success-contact.html")
        }
    });

});


// signup page route

app.post("/signup.html", function (req, res) {
    const fName = req.body.firstName;
    const lName = req.body.lastName;
    const email = req.body.email;

    const data = {
        members: [
            {
                email_address: email,
                status: "subscribed",
                merge_fields: {
                    FNAME: fName,
                    LNAME: lName
                }
            }
        ]
    };

    const jsonData = JSON.stringify(data);

    const url = "https://us6.api.mailchimp.com/3.0/lists/42c5b7bb4f";

    const options = {
        method: "POST",
        auth: "pao1:936fad1e30359a262825dabe5e347161-us6"
    }

    const request = https.request(url, options, function (response) {

        if (response.statusCode === 200) {
            res.sendFile(__dirname + "/success.html")
        } else {
            res.sendFile(__dirname + "/failure.html")
        }


        response.on("data", function (data) {
            console.log(JSON.parse(data));
        })
    });

    // request.write(jsonData);
    request.end()
});

//Signup back to homepage
app.post("/index", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});


// Failure route

app.post("/failure", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});

// Success to Homepage route

app.post("/success", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});

app.post("/success-contact", function (req, res) {
    res.sendFile(__dirname + "/index.html")
});


// Footer sign-up
app.post("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html")
});




app.listen(PORT, function () {
    console.log(`Server has start at port ${3000}`);
});