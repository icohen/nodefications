// express
var express = require('express'),
  app = express.createServer();


// session
//var session = require('sesh').session;


// socket
var io = require('socket.io');


// jade
//var jade = require('jade');


// ejs
var ejs = require('ejs');


// connect
var connect = require('connect');


// events
var events = require('events');


// file system
var fs = require('fs');


// mongoose
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/monitoring');


// configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
//  app.set('view engine', 'jade');
//  app.register('.jade', require('jade'));
  app.set('view engine', 'ejs');
  app.set('.html', require('ejs'));
  app.set('view options', {layout: true});
  app.use(express.bodyDecoder());
  app.use(express.methodOverride());
  app.use(express.cookieDecoder());
  app.use(express.session({key: 'user', secret: 'userK3y'}));
  app.use(app.router);
  app.use(express.staticProvider(__dirname + '/public'));
});


// development configuration
app.configure('development', function() {
  app.use(express.logger());
  app.use(express.errorHandler({ dumpException: true, showStack : true }));
});


// production configuration
app.configure('production', function() {
  app.use(express.logger());
  app.use(express.errorHandler());
});


// mongoose - model
require('./models/notification');
var notificationModel = mongoose.model('Notification');


// view all
app.get('/notifications', function(req, res) {
  if(req.session.user == null) {
    res.redirect('users/login');
  }

//  notificationModel.find({}, function(err, notifications) {
//  notificationModel.find({short_dscrptn : {$sort : -1}}, function(err, notifications) {
  //notificationModel.find({}, ['created_on']).sort(['date'], -1).execFind(function(err, notifications) {
  notificationModel.find({confirmed_on: null}).sort(['created_on'], -1).execFind(function(err, notifications) {
    if(err) {
      console.log(err);
    }

    res.render('notifications/index', {
      locals: {
        title: 'unaddressed notifications',
        notifications: notifications,
        username: req.session.user
      }
    });
/*
    for(var i in notifications) {
      console.log(notifications[i]._id);
      console.log(notifications[i].short_dscrptn);
      console.log(notifications[i].long_dscrptn);
      console.log(notifications[i].created_on);
    }
*/
  });
});


// create
app.get('/notification/new', function(req, res){
  var instance = new notificationModel();
  instance.short_dscrptn = req.param('subject');
  instance.long_dscrptn = req.param('body');
  instance.created_on = Date.now();
  instance.created_by = 'notifications@ping.com';
  instance.updated_on = Date.now();
  instance.updated_by = 'notifications@ping.com';
  instance.save(function(err) {
    if(err) {
      console.log(err);
      res.send('err');
    } else {
      socket.broadcast(instance);
      console.log('successful save');
      console.log(instance.short_dscrptn);
      console.log(instance.long_dscrptn);
      console.log(instance.confirmed_on);
      console.log(instance.confirmed_by)
      console.log(instance.created_on);
      console.log(instance.created_by);
      console.log(instance.updated_on);
      console.log(instance.updated_by);
      console.log(instance._id);
      res.send('successful save');
    }
  });
});


// update
app.get('/notification/:id/edit', function(req, res){
  if(req.session.user == null) {
    res.redirect('users/login');
  }

  notificationModel.update({_id: req.params.id}, function(err, notification) {
    if(err) {
      console.log(err);
    }
    notification.save(function(err) {
      if(err) {
        console.log(err);
      }
    });
  });
});


// delete
app.del('/notification/:id/remove', function(req, res){
  if(req.session.user == null) {
    res.redirect('users/login');
  }

  res.send('removing notification ' + req.params.id);
});


// view by id
app.get('/notification/:id', function(req, res){
  if(req.session.user == null) {
    res.redirect('users/login');
  }

  notificationModel.find({_id: req.params.id}, function(err, notification) {
    if(err) {
      console.log(err);
    }
  });
});


// mongoose - model
require('./models/user');
var userModel = mongoose.model('User');


// login
app.get('/users/login', function(req, res) {
  res.render('users/index', {
    layout: false,
    locals: {
      title: 'login'
    }
  });
});


// post
app.post('/users/login_validation', function(req, res) {
  var instance = new userModel();
  instance.email = req.body.username;
  instance.password = req.body.password;
  console.log(instance.email);
  console.log(instance.password);

/*
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", 'ldap://ldap://dca.dc.cbici.net/dc=dc,dc=cbici,dc=net?' + instance.email, false);
  xmlHttp.send(null);
  res.send(xmlHttp.responseText);
*/

  userModel.find({email: instance.email, password: instance.password}, function(err, users) {
    if(users.length == 1) {
      req.session.user = instance.email;
      res.redirect('/notifications');
    } else {
      res.redirect('/users/login');
    }
  });
});


// logout
app.get('/users/logout', function(req, res){
  req.session.user = null;
//  res.writeHead(200, {'Content-Type': 'text/plain'});
//  res.write('You\'ve been logged out');
//  res.end();
  res.redirect('/users/login');
});


app.get('/user', function(req, res){
//  session(req, res, function(req, res){
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.write('current session: \n' + JSON.stringify(req.session, 2, true));
//    res.end();
//  });

  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('current session: \n' + JSON.stringify(req.session, 2, true));
  res.write('current session: \n' + JSON.stringify(req.session.user, 2, true));
  res.end();
});


// unauthorized
app.get('*', function(req, res){
  res.send('your Jedi mind tricks will not work on me', 404);
});


//var fileEmitter = new events.EventEmitter();
//var newFileLstnr = fileEmitter.on('found', function(file) {
//  console.log('file found called');
//});


//app.get('*', function(req, res){
//  res.send('hello world');
//  socket.broadcast('heeloo');

/*
  var files = fs.readdirSync('media');
  file.forEach(function(file) {
    fileEmitter.emit('found', dest);
    socket.broadcast({'foo': dest});
  });
*/
//});


app.listen(8124);
console.log('express app started on port 8124');


var socket = io.listen(app)
  , buffer = [];

socket.on('connection', function(client){
  client.on('message', function(message){
    console.log(message);

    if (message.search("ack_remove:") > -1) {
      var ack = message.split(":");
      console.log("in");
      console.log(ack[0]);
      console.log(ack[1]);
      console.log(ack[2]);
      console.log("done");

      var id = ack[1];//message.replace("ack_remove:", '');
      
      console.log("id is begin");
      console.log(ack[1]);
      console.log("id is end");

      notificationModel.findById(id, function(err, notification) {
        if(err) {
          console.log(err);
        }

        //console.log(notification);
        //console.log(notification.created_on);
        //console.log(notification.short_dscrptn);
        //console.log(notification.long_dscrptn);
        //console.log(notification.updated_on);
        //console.log(updated_by);

        notification.confirmed_on = Date.now();
        notification.confirmed_by = ack[2];
        notification.updated_on = Date.now();
        notification.updated_by = ack[2];
        notification.save(function(err) {
          if(err) {
            console.log(err);
          }
        });
      });
    } else {
      var msg = { message: [client.sessionId, message] };
      buffer.push(msg);
      if (buffer.length > 15) buffer.shift();
      client.broadcast(msg);
      console.log(msg);
    }
  });
});


console.log('socket.io started on port 8124');
