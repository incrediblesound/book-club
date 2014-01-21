
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var passport = require('passport');
var member = mongoose.model('member');

exports.title = function(req, res) {
	res.render('title')
};

exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};

exports.register = function(req, res) {
	var name = req.body.name;
	var username = req.body.username;
  var password = req.body.password;
	new member({
		name: name,
		username: username,
		password: password,
		joined: Date.now()
	}).save(function (err, user) {
		if(err) {
			res.redirect('/');
		} else {
			req.login(user, function (err) {
				if(err) {
					console.log(err);
				}
				res.redirect('/main')
			})
		}
	})
}

exports.main = function(req, res) {
  res.render('main', {
    user: req.user
  });
}