var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

var Member = new Schema({
	name: String,
	username: { type: String, required: true, index: {unique: true} },
	password: {type: String, required: true},
	email: String,
	joined: Date,
	bio: String,
	genres: Array,
	authors: Array,
	following: Array
});

Member.pre('save', function(next) {
	var mem = this;
	if(!mem.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);

    bcrypt.hash(mem.password, salt, function(err, hash) {
      if (err) return next(err);

      mem.password = hash;
      next();
    });
  });
});

Member.methods.comparePassword = function(candidatePassword, cb) {
    bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
        if (err) return cb(err);
        cb(null, isMatch);
    });
};

var member = mongoose.model('member', Member);



var BookReview = new Schema({
	title: String,
	author: String,
	url: String,
	review: String,
	reviewby: String,
	genre: String,
	tags: Array,
	datetime: Date
});

var review = mongoose.model('review', BookReview);

var BookList = new Schema({
	name: String,
	items: Array,
	listby: String,
	datetime: Date
})

var list = mongoose.model('list', BookList);

var Note = new Schema({
	name: String,
	noteby: String,
	content: String,
	tags: Array,
	datetime: Date
})

var note = mongoose.model('note', Note);

var Action = new Schema({
	DateTime: Date,
	whodunnit: String,
	category: String, //note, review, list, request
	actionRef: String,
	author: String,
	genre: String,
	description: String

})

var action = mongoose.model('action', Action);

//var newsItem = new Schema({
//	userID: String,
//	actionID: String,
//	Relevancy: Date
//})

//var newsItem = mongoose.model('newsItem', newsItem);

var Message = new Schema({
	title: String,
	sender: String,
	recipient: Array,
	content: String,
	senton: Date
})

var Quest = new Schema({
	madeby: String,
	name: String,
	content: String,
	tags: Array,
	datetime: Date
})

var quest = mongoose.model('quest', Quest);

var message = mongoose.model('message', Message);

//mongoose.connect('mongodb://localhost/book');
mongoose.connect('mongodb://nodejitsu:f305f329284510303e0b5171ba9c4062@troup.mongohq.com:10066/nodejitsudb1283180546/book-club');