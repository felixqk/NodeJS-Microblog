
/**
 * Module dependencies.
 */


var express = require('express') //node_modules folder
  , routes = require('./routes') //relative path
  , user = require('./routes/user') 
  , http = require('http')
  , path = require('path')
  , fs = require('fs');

var accessLogfile = fs.createWriteStream('access.log', {flags: 'a'});
var errorLogfile = fs.createWriteStream('error.log', {flags:'a'});

var app = express();
var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
var flash = require('connect-flash');

app.configure(function(){
  app.use(express.logger({stream: accessLogfile}));
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: settings.cookieSecret,
    store: new MongoStore({
      db: settings.db
    })
  }));
  app.use(flash());

  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.use(function(req,res,next){
  res.locals.user = req.session ? req.session.user:'';
  var err=req.flash('error');
  res.locals.error=err.length?err:null;
  var suc=req.flash('success');
  res.locals.success=suc.length?suc:null;
  next();
});
  app.use(app.router);

routes(app);


// app.get('/', routes.index);
// app.get('/u/:user', routes.user);
// app.post('/post', routes.post);
// app.get('/reg', routes.reg);
// app.post('/reg', routes.doReg);
// app.get('/login', routes.login);
// app.post('/login', routes.doLogin);
// app.get('/logout', routes.logout);

app.configure('production', function(){
  app.use(function(err, req, res, next){
    res.send(500, { error: 'Sorry something bad happened!' });
    var meta = '[' + new Date() + ']' + req.url + '\n';
    errorLogfile.write(meta + err.stack + '\n');
    next();
  });
});

//if(!module.parent) {
  http.createServer(app).listen(app.get('port'), function(){
    console.log("Express server listening on port %d in %s mode", app.get('port'), app.settings.env);
  });
//}