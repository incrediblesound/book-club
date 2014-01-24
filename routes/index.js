
/*
 * GET home page.
 */
var mongoose = require('mongoose');
var passport = require('passport');
var member = mongoose.model('member');
var note = mongoose.model('note');
var action = mongoose.model('action');
var list = mongoose.model('list');
var review = mongoose.model('review');
var message = mongoose.model('message');

exports.title = function(req, res) {
	res.render('title')
};

exports.index = function(req, res) {
  res.render('index', { title: 'Express' });
};

exports.logout = function (req,res) {
  req.logout();
  res.redirect('/');
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
      console.log(err)
			res.redirect('/');
		} else {
			req.login(user, function (err) {
				if(err) {
					console.log(err);
				}
				res.redirect('/memberinfo')
			})
		}
	})
}

exports.memberinfo = function(req, res) {
  res.render('memberinfo');
}

exports.saveinfo = function(req, res) {
  var genres = req.body.genres
  var authors = req.body.authors.split(", ")
  member.update({username: req.user.username}, {
    genres: genres,
    authors: authors
  }).exec(function (err, member) {
    res.redirect('/main')
  })
}

exports.main = function(req, res) {
  action.find().sort({DateTime:1}).limit(20).exec(function (err, actions, count) {
    var notes = [];
    var lists = [];
    var reviews = [];
    var requests = [];
    var i;
    console.log(actions)
    for(i=0;i<actions.length;i++) {
      if(actions[i].whodunnit !== req.user.username) {
        if(actions[i].category === 'note' && inArray(actions[i].whodunnit, req.user.following)) {
          notes.push(actions[i]);
        } 
        else if(actions[i].category === 'list' && inArray(actions[i].whodunnit, req.user.following)) {
          lists.push(actions[i]);
        }
        else if(actions[i].category === 'review' && inArray(actions[i].author, req.user.authors) || inArray(actions[i].genre, req.user.genres) || inArray(actions[i].whodunnit, req.user.following)) {
          reviews.push(actions[i]);
        } 
        else if(actions[i].category === 'request' && inArray(actions[i].whodunnit, req.user.following)) {
          requests.push(actions[i]);
        }
      }
    }
    res.render('main', {
    user: req.user,
    notes: notes,
    lists: lists,
    reviews: reviews,
    requests: requests
    });
  }) 
}

exports.follow = function(req, res) {
  var Member = req.body.member
  console.log(Member);
  if(req.user.username !== Member) {
    member.update({username: req.user.username}, {$push: {following: Member}}).exec(function (err, data) {
      res.redirect('/profile/'+ Member)
    })    
  }
}

exports.notes = function(req, res) {
  note.find({noteby: req.user.username}).exec(function (err, notes) {
    console.log(notes);
    res.render('notes', {
    user: req.user,
    notes: notes
    })
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
      description: req.user.name + " wrote a note called " + thisnote.name
    }).save(function (err, thisaction) {
      res.redirect('/notes');
    })
  })
}

exports.profile = function(req, res) {
  var key = req.params.username
  member.findOne({ username: key }).exec(function (err, Member) {
    note.find({ noteby: key }).exec(function (err, notes) {
      list.find({ listby: key }).exec(function (err, lists) {
        review.find({ reviewby: key }).exec(function (err, reviews) {
          console.log(Member);
          res.render('profile', {
            Member: Member,
            notes: notes,
            lists: lists,
            reviews: reviews
          })
        })
      })
    })
  })
}

exports.lists = function(req, res) {
  list.find({listby: req.user.username}).exec(function (err, lists) {
    res.render('lists', {
      lists: lists
    })
  })
}

exports.savelist = function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  new list({
    name: req.body.name,
    listby: req.user.username,
    items: listObject(title,author,description)
    }).save(function (err, thislist) {
      new action({
      DateTime: Date.now(),
      whodunnit: req.user.username,
      category: "list",
      actionRef: thislist._id,
      description: req.user.name + " made a new list called " + thislist.name
    }).save(function (err, thisaction) {
      res.redirect('/lists');
    })
    })
}

exports.review = function(req, res) {
  review.find({reviewby: req.user.username}).exec(function (err, reviews) {
    res.render('review', {
      reviews: reviews
    })
  })
}

exports.savereview = function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var content = req.body.content;
  var genre = req.body.genre;
  var tags = (req.body.tags.split(", ") || null )
  new review({
    title: title,
    author: author,
    review: content,
    reviewby: req.user.username,
    genre: genre,
    tags: tags
  }).save(function (err, thisreview) {
    new action({
      DateTime: Date.now(),
      whodunnit: req.user.username,
      category: "review",
      actionRef: thisreview._id,
      author: thisreview.author,
      genre: thisreview.genre,
      description: req.user.name + " wrote a new review of " + thisreview.title
    }).save(function (err, thisaction) {
      res.redirect('/reviews')
    })
  })
}
exports.viewMessage = function (req, res) {
  message.find({recipient: req.user.username}).exec(function (err, messages) {
    var inside = function(messages) {
      for(i=0;i<messages.length;i++) {
        console.log(messages[i]._id)
        if(messages[i]._id == req.params.ID) {
          return messages[i];
        }
      }
    }
    var focus = inside(messages);
    console.log(focus);
    res.render('messageview', {
      message: focus,
      others: messages
    })
  })
}

exports.messages = function (req, res) {
  message.find({recipient: req.user.username}).exec(function (err, mssgs) {
    member.find({username: {$in: req.user.following}}).exec(function (err, fllwng) {
      res.render('messages', {
        mssgs: mssgs,
        fllwng: fllwng
      })
    })
  })
}

exports.sendMessage = function (req, res) {
  new message({
    title: req.body.title,
    sender: req.user.username,
    recipient: req.body.sendto,
    content: req.body.content,
    senton: Date.now()
  }).save(function (err, mess) {
    res.redirect('/messages');
  })
}

exports.compose = function (req, res) {
  res.render('compose', {
    to: req.body.sendto
  })
}

listObject = function(title,author,description){

  List = [];

  for(i=0;i<title.length;i++){

    listItem = {
    title: title[i],
    author: author[i],
    Description: description[i]
    }
  list.push(listItem);
  };
  return List;
}

var inArray = function(item, array) {
  for(i=0;i<array.length;i++) {
    if(array[i] === item) {
      return true;
    }
  };
}