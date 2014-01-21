
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var passport = require('passport');
var member = mongoose.model('member');
var note = mongoose.model('note');
var action = mongoose.model('action');

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
  action.find().sort({DateTime:1}).limit(20).exec(function (err, actions, count) {
    res.render('main', {
    user: req.user,
    actions: actions
    });
  }) 
}

exports.notes = function(req, res) {
  res.render('notes', {
    user: req.user
  })
}

exports.savenote = function(req, res) {
  var title = req.body.title;
  var body = req.body.title;
  new note({
    name: title,
    noteby: req.user.username,
    content: body
  }).save(function (err, thisnote) {
    new action({
      DateTime: Date.now(),
      whodunnit: req.user.username,
      category: "note",
      actionRef: thisnote._id,
      description: req.user.name + " has written a note called " + thisnote.name
    }).save(function (err, thisaction) {
      res.redirect('/notes');
    })
  })
}