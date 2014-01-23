var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var Member = new Schema({
	name: String,
	username: { type: String, index: {unique: true} },
	password: String,
	joined: Date,
	bio: String,
	genres: Array,
	authors: Array,
	following: Array
});

var member = mongoose.model('member', Member);

var BookReview = new Schema({
	title: String,
	author: String,
	review: String,
	reviewby: String,
	genre: String,
	tags: Array
});

var review = mongoose.model('review', BookReview);

var BookList = new Schema({
	name: String,
	items: Array,
	listby: String
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
	author: String,
	genre: String,
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