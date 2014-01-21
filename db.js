var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Member = new Schema({
	name: String,
	username: { type: String, index: {unique: true} },
	password: String,
	joined: Date,
	bio: String
});

var member = mongoose.model('member', Member);

var BookReview = new Schema({
	title: String,
	author: String,
	Subject: String,
	review: String,
	reviewBy: String,
	tags: Array
});

var BookList = new Schema({
	title: String,
	items: Array,
	listBy: String
})

var Note = new Schema({
	name: String,
	noteby: String,
	content: String,
	tags: Array
})

var Action = new Schema({
	DateTime: Date,

})

mongoose.connect('mongodb://localhost/book');