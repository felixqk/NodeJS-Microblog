var mongodb = require('./db');
var User = require('../models/user.js');

function Post(username, post, time) {
	this.user = username;
	this.post = post;
	if(time){
		this.time = time;
	} else {
		this.time = new Date();
	}
};
module.exports = Post;

Post.prototype.save = function save(callback){
	// save to Mongodb
	var post ={
		user: this.user,
		post: this.post,
		time: this.time,
	};
	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			// set index for user
			collection.ensureIndex('user');
			// write post doc
			collection.insert(post, {safe: true}, function(err, user){
				mongodb.close();
				callback(err, user);
			});
		});
	});
};

Post.get = function get(username, callback){
	mongodb.open(function(err, db){
		if (err){
			return callback(err);
		}
		//read posts collection
		db.collection('posts', function(err, collection){
			if(err){
				mongodb.close();
				return callback(err);
			}
			//find document with property as 'username', if 'null' return all
			var query ={};
			if (username) {
				query.user = username;
			}
			collection.find(query).sort({time:-1}).toArray(function(err, docs){
				mongodb.close();
				if(err){
					callback(err, null);
				}
				// encapsulate posts as Post object
				var posts = [];
				docs.forEach(function(doc, index){
					var post = new Post(doc.user, doc.post, doc.time);
					posts.push(post);
				});
				callback(null, posts);

			});
		});
	});
};




