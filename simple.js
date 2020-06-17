var express = require('express')
var app = express()


// middleware functions that express uses
var myLogger = function ( req, res, next ) {
    console.log("LOGGED");
    // next must be called to invoke the next middleware function
    next();
}

var requestTime = function (req, res, next) {
    req.requestTime = Date.now()
    next()
}



//

// middleware function
app.use(myLogger);
app.use(requestTime);
// notice middleware function is logged only  before 'use' is declared
app.get('/', function (req, res, next) {
    var responseText = 'Hello World!<br>'
    responseText += '<small> Request at: ' + req.requestTime + '</small>'
    res.send(responseText)
    req.LoggedIn = 123;
    next()
}, function(req,res) {
    console.log(req);
    console.log("next");
})

app.get('/secret', function (req, res) {
    res.redirect('http://google.com');

})
app.listen(3000); console.log("listening on port 3000");
