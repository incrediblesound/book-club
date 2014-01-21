
/**
 * Module dependencies.
 */
require('./db');
var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require( 'passport' );
var LocalStrategy = require( 'passport-local' ).Strategy
var mongoose = require('mongoose');
var member = mongoose.model('member');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser('books'));
app.use(express.json());
app.use(express.session());
app.use(passport.initialize());
app.use(passport.session());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}
passport.use(new LocalStrategy(
	function(email,password,done) {
		member.findOne({ email: email }, function(err,user){
			if(err) { return done(err); }
			if(!user) {
				return done(null, false, { message: 'incorrect email' });
			}
			if(password !== user.password) {
				return done(null, false, { message: 'incorrect password' });
			}
			return done(null, user);
		});
	}
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  member.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get('/', routes.title);
app.post('/register', routes.register);
app.get('/main', routes.main)

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});