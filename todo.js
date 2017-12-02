/* Author: Chandan Troughia */

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var redis = require('redis');

//our main variable
var application = express();

//redis client
var client = redis.createClient();
client.on('connect', function(){
  console.log("connected to redis")
});

//view engine
application.set('views', path.join(__dirname, 'views')); //we are basically telling the system that we are usign views folder for our views
application.set('view engine', 'ejs'); //

//middeleware
application.use(bodyParser.json());
application.use(bodyParser.urlencoded({extended: false}));

//we need to have a static folder where we will keep our css or any front end elements/js -- in our case use are using public folder
application.use(express.static(path.join(__dirname, 'public')));
//create route page for home page

application.get('/', function(req, res){
  var title = 'Redis Todos';

  client.lrange('todos', 0, -1, function(err, reply){
      if(err){
        res.send(err);
      }
      res.render('index', {
        title : title,
        todos : reply
      });
  });
});

//we are goind to get the data in from the form and save it to Redis
//it's a post request
application.post('/todo/add', function(req, res, next){
    var todo = req.body.todo;
    client.rpush('todos', todo, function(err, reply){
      if(err){
        res.send(err);
      }
      console.log('Todo added..');
      res.redirect('/');
    });
});

//deleting from
application.post('/todo/delete', function(req, res, next){
	var delTodos = req.body.todos;

	client.lrange('todos', 0, -1, function(err, todos){
		for(var i = 0;i < todos.length;i++){
			if(delTodos.indexOf(todos[i]) > -1){
				client.lrem('todos', 0, todos[i], function(){
					if(err){
						console.log(err);
					}
				});
			}
		}
		res.redirect('/');
	});
});

application.listen(3000, function(){
  console.log("Working on port 3000...")
});

//console.log('hello');

module.exports = application;
