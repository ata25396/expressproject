var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var index = require('./routes/index');
var users = require('./routes/users');
var expressValidator = require('express-Validator');
var app = express();
var mongojs=require('mongojs');
var db =mongojs('customerapp',['users']);

app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.use(function(req, res, next) {
  res.locals.errors=null;
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:'ata',resave:false,saveUninitialized:true}));
app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.get('/',function(req, res){
  db.users.find(function(err,docs){
    console.log.(docs);
    res.render('index',{
      title:'Portofolio site',
      users:docs
    });
  });
});

app.post('/users/add',function(req, res){

  req.checkBody('fname','First name is required.').notEmpty();
  req.checkBody('lname','Last name is required.').notEmpty();
  req.checkBody('id','id is required.').notEmpty();
  req.checkBody('username','username is required.').notEmpty();
  req.checkBody('password','password is required.').notEmpty();

  var errors= req.validationErrors();

  if(errors){
    res.render('index',{
      title:'Portofolio site',
      users:users,
      errors:errors
    });
  }else{
    var newUser = {
      fname=req.body.fname;
      lname=req.body.lname;
      id=req.body.id;
      username=req.body.username;
      password=req.body.password;
    }
    db.users.insert(newUser,function(err,result){
      if(err){
        console.log(err);
      }else{
        res.redirect('/');
      }
    })
  }
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
