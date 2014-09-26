var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');
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
  var member = this;
  if(!member.isModified('password')) return next();

  bcrypt.hash(member.password, null, null, function(err, hash) {
    if (err) return next(err);

    member.password = hash;
    next();
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
//  userID: String,
//  actionID: String,
//  Relevancy: Date
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

var connection = process.env.DB || 'mongodb://localhost/book';
mongoose.connect(connection);