
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
var quest = mongoose.model('quest');

exports.title = function(req, res) {
  action.find({category:"review"}).sort({DateTime:-1}).limit(3).exec(function (err, reviews) {
    action.find({category:"list"}).sort({DateTime:-1}).limit(3).exec(function (err, lists) {
      res.render('title', {
        reviews: reviews,
        lists: lists
      })
    })
  })
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
  var email = req.body.email;
	new member({
		name: name,
		username: username,
		password: password,
    email: email,
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
  res.render('memberinfo', {
    genres: genresArray
  });
}

exports.saveinfo = function(req, res) {
  var genres = req.body.genres;
  var authors = req.body.authors.split(", ");
  var bio = req.body.bio;
  member.update({username: req.user.username}, {
    genres: genres,
    bio: bio,
    authors: authors
  }).exec(function (err, member) {
    res.redirect('/main')
  })
}

exports.following = function(req, res) {
  member.find({username: {$in: req.user.following}}).exec(function (err, friends) {
    res.render('following', {
      friends: friends
    })
  })
}

exports.unfollow = function(req, res) {
  var usrnm = req.body.username;
  member.update({username: req.user.username}, {$pull: {following: usrnm}}).exec(function (err, data) {
    res.redirect('/following');
  })
}

exports.about = function(req, res) {
  res.render('about');
};

exports.main = function(req, res) {
if(!req.user) {
  res.redirect('/');
} else {
  action.find().sort({DateTime:-1}).limit(20).exec(function (err, actions, count) {
    message.find().exec(function (err, messages) {
      var count = messageCount(req.user.username,messages);
      var actionList = [];
      var i;
      for(i=0;i<actions.length;i++) {
        if(actions[i].whodunnit !== req.user.username) {
          if(actions[i].category === 'note' && inArray(actions[i].whodunnit, req.user.following)) {
            actionList.push(actions[i]);
          }
          else if(actions[i].category === 'list' && inArray(actions[i].whodunnit, req.user.following)) {
            actionList.push(actions[i]);
          }
          else if(actions[i].category === 'review' && inArray(actions[i].author, req.user.authors) || actions[i].category === 'review' && inArray(actions[i].genre, req.user.genres) || actions[i].category === 'review' && inArray(actions[i].whodunnit, req.user.following)) {
            actionList.push(actions[i]);
          } 
          else if(actions[i].category === 'request' && inArray(actions[i].whodunnit, req.user.following)) {
            actionList.push(actions[i]);
          }
          else if(actions[i].category === 'follow' && actions[i].actionRef === req.user.username) {
            actionList.push(actions[i]);
          }
        }
      }
      res.render('main', {
      user: req.user,
      actionList: actionList,
      messages: count,
      empty: empty
      });
    })
  })
}
}

exports.follow = function(req, res) {
  var Member = req.body.member
  if(req.user.username !== Member && !inArray(Member, req.user.following)) {
    member.update({username: req.user.username}, {$push: {following: Member}}).exec(function (err, data) {
      new action({
        DateTime: Date.now(),
        whodunnit: req.user.username,
        category: "follow",
        actionRef: req.body.member,
        description: req.user.username + " is now following you!"
      }).save(function (err, action) {
        res.redirect('/profile/'+ Member)
      })
    })    
  } else {
    res.redirect('/profile/' + Member)
  }
}

exports.notes = function(req, res) {
  note.find({noteby: req.user.username}).exec(function (err, notes) {
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
    content: body,
    datetime: Date.now()
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

exports.requests = function(req, res) {
  quest.find({madeby: req.user.username}).exec(function (err, quests) {
    res.render('request', {
      requests: quests
    })
  })
}

exports.saverequest = function(req, res) {
  new quest({
    madeby: req.user.username,
    name: req.body.name,
    content: req.body.content,
    tags: req.body.tags.split(", "),
    datetime: Date.now()
  }).save(function (err, thisquest) {
    new action({
      DateTime: Date.now(),
      whodunnit: req.user.username,
      category: "request",
      actionRef: thisquest._id,
      description: req.user.name + " made a request called " + thisquest.name
    }).save(function (err, thisaction) {
      res.redirect('/requests');
    })
  })
}

exports.profile = function(req, res) {
  if(!req.user) {
    res.redirect('/');
  } else {
  var key = req.params.username
  member.findOne({ username: key }).exec(function (err, Member) {
    note.find({ noteby: key }).exec(function (err, notes) {
      list.find({ listby: key }).exec(function (err, lists) {
        review.find({ reviewby: key }).exec(function (err, reviews) {
          quest.find({ madeby: key }).exec(function (err, quests) {
          res.render('profile', {
            Member: Member,
            user: req.user,
            notes: notes,
            lists: lists,
            reviews: reviews,
            quests: quests
          })
        })
        })
      })
    })
  })
}
}

exports.lists = function(req, res) {
  list.find({listby: req.user.username}).exec(function (err, lists) {
    res.render('lists', {
      lists: lists
    })
  })
}

exports.newlist = function(req, res) {
  var num = req.body.num;
  res.render('newlist', {
    num: num
  })
}

exports.savelist = function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var description = req.body.description;
  var url = req.body.url;
  new list({
    name: req.body.name,
    listby: req.user.username,
    items: listObject(title,author,url,description),
    datetime: Date.now()
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
      reviews: reviews,
      genres: genresArray
    })
  })
}

exports.savereview = function(req, res) {
  var title = req.body.title;
  var author = req.body.author;
  var content = req.body.content;
  var genre = req.body.genre;
  var tags = req.body.tags.split(", ");
  var url = req.body.url;
  new review({
    title: title,
    author: author,
    url: url,
    review: content,
    reviewby: req.user.username,
    genre: genre,
    tags: tags,
    datetime: Date.now()
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
        if(messages[i]._id == req.params.ID) {
          return messages[i];
        }
      }
    }
    var focus = inside(messages);
    res.render('messageview', {
      message: focus,
      others: messages
    })
  })
}

exports.messages = function (req, res) {
  message.find().exec(function (err, mssgs) {
    var toMe = recipientList(req.user.username, mssgs);
    member.find({username: {$in: req.user.following}}).exec(function (err, fllwng) {
      res.render('messages', {
        mssgs: toMe,
        user: req.user,
        fllwng: fllwng
      })
    })
  })
};

exports.deleteMessage = function (req, res) {
  var username = req.user.username
  message.update({_id: req.params.ID}, {$pull: {recipient: username}}, function (err, data) {
    message.remove({recipient: []}, function (err,data) {
      res.redirect('/messages');
    })
  })
}

exports.viewreview = function (req, res) {
  review.findOne({_id: req.params.ID}).exec(function (err, review) {
    res.render('viewreview', {
      review: review,
      user: req.user
    })
  })
};

exports.viewnote = function (req, res) {
  note.findOne({_id: req.params.ID}).exec(function (err, note) {
    res.render('viewnote', {
      note: note
    })
  })
};

exports.viewlist = function (req, res) {
  list.findOne({_id: req.params.ID}).exec(function (err, list) {
    res.render('viewlist', {
      list: list
    })
  })
}

exports.viewrequest = function (req, res) {
  quest.findOne({_id: req.params.ID}).exec(function (err, quest) {
    var friend = inArray(quest.madeby, req.user.following);
    res.render('viewrequest', {
      quest: quest,
      friend: friend
    })
  })
}

exports.sendMessage = function (req, res) {
  var to = req.body.sendto.split(",");
  new message({
    title: req.body.title,
    sender: req.user.username,
    recipient: to,
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

exports.search = function (req, res) {
  var listResults = [];
  var reviewResults = [];
  var questResults = [];
  list.find( function (err, lists) {
    review.find( function (err, reviews) {
      quest.find( function (err, quests) {
        var Q = req.body.query.split(" ");
        var l;
        var i;
        for(l=0;l<Q.length;l++) {
          for(i=0;i<lists.length;i++) {
            if( match(Q[l], lists[i].name) && !(inArray(lists[i],listResults)) ) {
              listResults.push(lists[i]);
            }
          }
        }
        for(l=0;l<Q.length;l++) {
          for(i=0;i<reviews.length;i++) {
            if( match(Q[l], reviews[i].genre) || match(Q[l], reviews[i].tags)) {
              if(!inArray(reviews[i], reviewResults)) {
                reviewResults.push(reviews[i]);
              }
            }
          }
        }
        for(l=0;l<Q.length;l++) {
          for(i=0;i<quests.length;i++) {
            if( match(Q[l], quests[i].tags) && !(inArray(quests[i], questResults)) || match(Q[l], quests[i].name) && !(inArray(quests[i], questResults))) {
              questResults.push(quests[i]);
            }
          }
        }
        res.render('results', {
          lists: listResults,
          reviews: reviewResults,
          quests: questResults
        })
      })
    })
  })
}
//these are just helper functions you nosy bastard

var recipientList = function (username, messages) {
  var i;
  var l;
  var r = []
  for(i=0; i<messages.length;i++) {
    var to = messages[i].recipient;
    for(l=0; l<to.length;l++) {
      if(username === to[l]) {
        r.push(messages[i]);
        break;
      }
    }
  }
  return r;
}

var messageCount = function (username, messages) {
  var i;
  var l;
  var count = 0
  for(i=0; i<messages.length;i++) {
    var recip = messages[i].recipient;
    for(l=0; l<recip.length;l++) {
      if(username === recip[l]) {
        count += 1;
        break;
      }
    }
  }
  return count;
}

var inArray = function(object, array) {
  var iA;
  for(iA = 0; iA<array.length; iA++) {
    if(object === array[iA]) {
      return true;
    }
  }
  return false;
}

var match = function (string, field) {
  var i;
  if(typeof field !== 'object') {
    var array = field.split(" ");
  } else {
    var array = field
  }
  for(i=0;i<array.length;i++) {
    if(string.toLowerCase() === array[i].toLowerCase()) {
      return true;
    }
  }
  return false;
}

listObject = function(title,author,url,description){

  List = [];

  for(i=0;i<title.length;i++){

    listItem = {
    title: title[i],
    author: author[i],
    url: url[i],
    description: description[i]
    }
  List.push(listItem);
  };
  return List;
}

var inArray = function(item, array) {
  if(!array) {
    return false
  }
  for(i=0;i<array.length;i++) {
    if(array[i] === item) {
      return true;
    }
  };
}

var genresArray = [
"science fiction",
"history",
"romance",
"horror",
"travel",
"science",
"classics",
"philosophy",
"historical fiction",
"fiction",
"fantasy",
"mystery",
"short story",
"biography",
"autobiography",
"how to",
"essay",
"textbook",
"childrens literature",
"non fiction",
"technology",
"blog"
]

var empty = {
  message: "If you see this message, it's because your news feed is empty. There are a number of reasons why this could be the case:",
  one: "You aren't following anybody. Search for some content, find a reviewer you like and follow them",
  two: "There is no content yet in your field of interest. Now is your chance to break ground and contribute some quality reviews to Book Club.",
  three: "You did not select any genres when you filled out your member information. I have not yet implemented a feature to solve this problem, but following the advice above will fill this empty space right quick!"
}