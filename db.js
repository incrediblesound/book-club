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

var review = mongoose.model('review', BookReview);

var BookList = new Schema({
	title: String,
	items: Array,
	listBy: String
})

var list = mongoose.model('list', BookList);

var Note = new Schema({
	name: String,
	noteby: String,
	content: String,
	tags: Array
})

var note = mongoose.model('note', Note);

var Action = new Schema({
	DateTime: Date,
	whodunnit: String,
	category: String, //note, review, list, request
	actionRef: String,
	description: String

})

var action = mongoose.model('action', Action);

var newsItem = new Schema({
	userID: String,
	actionID: String,
	Relevancy: Date
})

var newsItem = mongoose.model('newsItem', newsItem);

mongoose.connect('mongodb://localhost/book');