const express = require('express');
const app = express();
const passport = require('passport');
// https://www.sitepoint.com/local-authentication-using-passport-node-js/
app.use(express.static(__dirname));


const bodyParser = require('body-parser');
const expressSession = require('express-session')({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
});

// Middleware functions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSession);
//

const port = 3000;
app.listen(port, () => console.log('App listening on port ' + port));

app.use(passport.initialize());
app.use(passport.session());

/* MONGOOSE SETUP */
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/MyDatabase',
    { useNewUrlParser: true, useUnifiedTopology: true });

const Schema = mongoose.Schema;
const UserDetail = new Schema({
    username: String,
    password: String
});

UserDetail.plugin(passportLocalMongoose);
const UserDetails = mongoose.model('userInfo', UserDetail, 'userInfo');

/* PASSPORT LOCAL AUTHENTICATION */
passport.use(UserDetails.createStrategy());

passport.serializeUser(UserDetails.serializeUser());
passport.deserializeUser(UserDetails.deserializeUser());


/* ROUTES */
const connectEnsureLogin = require('connect-ensure-login');

app.post('/login', (req, res, next) => {
    passport.authenticate('local', 
        (err, user, info) => {
            if(err) {
                return next(err);
            }
            if(!user) {
                return res.redirect('/login?info=' +info);
            }


            // set by passport internally
            req.logIn(user, function(err) {
                if(err) {
                    return next(err);
                }
                return res.redirect('/');
            });
        }
    )(req, res, next);
});

/*     app.get('/protected', function(req, res, next) {
*       passport.authenticate('local', function(err, user, info, status) {
*         if (err) { return next(err) }
*         if (!user) { return res.redirect('/signin') }
*         res.redirect('/account');
*       })(req, res, next);
*     });
*/

// Here: redirectTo and setReturnTo are options passed in to ensureLoggedIn().
// Internally the function checks to see if isAuthenticated is true; declared from passport 
// ensureLoggedIn({ redirectTo: '/session/new', setReturnTo: false }),
app.get('/login',
  (req, res) => res.sendFile('html/login.html',
  { root: __dirname })
);

app.get('/',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/index.html', {root: __dirname})
);

app.get('/private',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.sendFile('html/private.html', {root: __dirname})
);

app.get('/user',
  connectEnsureLogin.ensureLoggedIn(),
  (req, res) => res.send({user: req.user})
);



// Register some users
//UserDetails.register({username:'paul', active: false}, 'paul');
//UserDetails.register({username:'jay', active: false}, 'jay');
//UserDetails.register({username:'roy', active: false}, 'roy');

