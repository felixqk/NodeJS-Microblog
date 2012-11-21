
/*
 * GET home page.
 */


var crypto = require('crypto');
var User = require('../models/user.js');
var flash = require('connect-flash');
var Post = require('../models/post.js');

module.exports = function(app) { 
	app.get('/', function(req, res) {
		//throw new Error('An error for test purposes.');
		Post.get(null, function(err, posts){
			if(err) {
				posts = [];
			}
			res.render('index', { 
				title: 'HomePage',
				posts: posts,
			}); 		
		});
	});
	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res) {
 		res.render('reg', {
		title: 'Register', 
		});
	});
	app.get('/reg', checkNotLogin);
	app.post('/reg', function(req, res) {
		if(req.body['password-repeat']!= req.body['password']){
			req.flash('error', '2 passwords didnt match');
			return res.redirect('/reg');
		}
		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		var newUser = new User({
			name: req.body.username,
			password:password,
		});
		
		User.get(newUser.name, function(err, user){
			if(user)
				err = 'Username already exists.';
			if(err){
				req.flash('error', err);
				return res.redirect('/reg');
			}

			newUser.save(function(err){
				if(err){
					req.flash('error', err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success','Register Succeed');
				res.redirect('/');
			});
		});

	}); 

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res){
		res.render('login',{
			title: 'User Login',
		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res){

		var md5 = crypto.createHash('md5');
		var password = md5.update(req.body.password).digest('base64');

		User.get(req.body.username, function(err, user){
			if(!user){
				req.flash('error', 'User doesnt exsit');
				return res.redirect('/login');
			}
			if(user.password != password) {
				req.flash('error', 'Password didnt match');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', 'login succeed');
			res.redirect('/');
		});
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success', 'logout suceed');
		res.redirect('/');
	});

	function checkLogin(req, res, next){
		if(!req.session.user){
			req.flash('error','Not login');
			return res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next){
		if(req.session.user){
			req.flash('error','Already login');
			return res.redirect('/');
		}
		next();
	}

	app.post('/post', checkLogin);
	app.post('/post', function(req, res){
		var currentUser = req.session.user;
		var post = new Post(currentUser.name, req.body.post);
		post.save(function(err){
			if (err) {
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', 'Succeed');
			res.redirect('/u/'+ currentUser.name);
		});
	});
	app.get('/u/:user', checkLogin);
	app.get('/u/:user', function(req, res){
		User.get(req.params.user, function(err, user){
			if(!user) {
				req.flash('error', 'User not exist');
				return res.redirect('/');
			}
			Post.get(user.name, function(err, posts){
				if (err){
					req.flash('error', err);
					return res.redirect('/');
				}
				res.render('user', {
					title: user.name,
					posts: posts,
				});
			});
		});
	});
};






