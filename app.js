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
const session = require('express-session');
const flash = require('connect-flash');
const ejs = require('ejs');
const Swal = require('sweetalert2');




const app = express();

const PORT = process.env.PORT || 3000

app.use(express.static("public"));

//View engine setup

app.engine('handlebars', exphbs());
app.set('view engine', 'ejs');

//Body Parser Middleware

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//init session

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 60000
    }

})
);

app.use(flash());

app.get("/", function (req, res) {
    res.render('index')
});



// app.get("/", function (req, res) {
//     const message = req.flash('message', 'saved successfully')
//     res.render('/index', { message });
// });


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
            res.status(500).send(err);
        } else {
            res.render('success-contact')
            // res.render('index').send(Swal.fire('Any fool can use a computer'));

        }
    });

});






// signup page route

app.post('/signup', (req, res) => {
    const { firstName, lastName, email } = req.body;

    if (!firstName || !lastName || !email) {
        res.render('failure');
    }

    const data = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: firstName,
                    LNAME: lastName
                }
            }
        ]
    }
    const url = process.env.URL
    const api = process.env.API
    const postData = JSON.stringify(data);
    const options = {
        url: url,
        method: 'POST',
        headers: {
            authorization: api
        },
        body: postData
    }

    request(options, (error, response, body) => {
        if (error) {
            res.render('failure');
        } else {
            if (response.statusCode === 200) {
                res.render('success');
            } else {
                res.render('failure');
            }
        }
    });
});



//Signup back to homepage
app.post("/index", function (req, res) {
    res.render('index');
});


// Failure route

app.post("/failure", function (req, res) {
    res.render('signup')
});

// Success to Homepage route

app.post("/success", function (req, res) {
    res.render('index')
});

app.post("/success-contact", function (req, res) {
    res.render('index');
});


// Footer sign-up
app.post("/newsletter", function (req, res) {
    res.render('newsletter')
});




app.listen(PORT, function () {
    console.log(`Server has start at port ${3000}`);
});