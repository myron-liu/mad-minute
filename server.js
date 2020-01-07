const express = require('express');
const redis = require('redis');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors')
const mysql = require('mysql');
const async = require('async');
const path = require('path');
const database = require('./database')

const router = express.Router()
const app = express();
const redisStore = require('connect-redis')(session);
const client = redis.createClient()
const ONE_DAY = 1000 * 60 * 60 * 24

const {
  PORT = 3000,
  SESS_LIFETIME = ONE_DAY,
  NODE_ENV = process.argv[2] || 'dev',
  SESS_NAME = 'sid',
  SESS_SECRET = 'magic!',
} = process.env
const IN_PROD = NODE_ENV === 'prod'
console.log(NODE_ENV)

var redisConfig;
redisConfig = {
    host: 'localhost',
    port: 6379,
    client: client, 
    ttl: 260,
}


const ACTIONS = {
  signin: 'signin',
  signup: 'signout',
  logout: 'logout',
}
const db = database.runDatabase(NODE_ENV)

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
        // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
}


// Helpers
function checkUsername(username) {
  var err = false;
  if (username.length == 0) {
    err = 'No username inputted'
  } else if (username.length > 20) {
    err = 'Username can be at most 20 characters'
  } else if (!username.match(/^[\w]+$/)) {
    err = 'Username must be alphanumeric'
  }
  return err
}

function checkPassword(password) {
  var err = false;
  if (!password || password.length < 6) {
    err = 'Password must be at least 6 characters'
  }
  return err
}

function getDate(date) {
  switch (date) {
    case 'today':
      date = 'NOW() - INTERVAL 24 HOUR';
      break;
    case 'week':
      date = 'CURDATE() - INTERVAL 7 DAY';
      break;
    case 'month':
      date = 'CURDATE() - INTERVAL 31 DAY';
      break;
    case 'year':
      date = 'CURDATE() - INTERVAL 365 DAY';
      break;
    default:
      break;
  }
  return date
}

// Server handling
app.use(session({
  name: SESS_NAME,
  resave: false,
  saveUninitialized: false,
  store: new redisStore(redisConfig),
  secret: SESS_SECRET,
  cookie: {
    maxAge: SESS_LIFETIME,
    sameSite: true,
    secure: IN_PROD,
  },
}))
 
app.use(allowCrossDomain);
app.use(bodyParser.json());      
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/views'));


// Resources
app.get('/', (req, res) => {
  res.sendFile('index.html');
})

app.get('/home', (req, res) => {
  res.sendFile('home.html')
})

app.get('/highscores', (req, res) => {
  res.sendFile('highscores.html')
})

app.get('/statistics', (req, res) => {
  res.sendFile('statistics.html')
})

app.get('/contact', (req, res) => {
  res.sendFile('contact.html')
})

app.get('/session', (req, res) => {
  if (req.session.userId) {
    res.json({status: 1, userId: req.session.userId, username: req.session.username});
  } else {
    res.json({status: 0, userId: 0});
  }
  res.end();
})


app.post('/user', async (req, res) => {
  const { username, password } = req.body;
  var err = checkPassword(password);
  err = checkUsername(username);
  var success = 0;
  var user = null;
  if (!err) {
    user = await db.getUser(username);
    if (user === null) {
      err = 'User does not exist';
    }
  }
  if (!err) {
    if (user.user_password !== password) {
      err = 'Invalid password';
    } else {
      req.session.userId = user.user_id;
      req.session.username = user.user_name;
      success = 1;
    }
  } 
  res.json({status:success, msg: err});
  db.postAction(req.session.userId || 1, username, password, success, ACTIONS.signin);
})

app.post('/newuser', async (req, res) => {
  const { username, password } = req.body;
  var success = 0;
  var err = checkPassword(password);
  err = checkUsername(username);
  if (!err) {
    var user = await db.getUser(username);
    if (user === null) {
      await db.postUser(username, password);
      user = await db.getUser(username);
      console.log('User sign up complete!');
      req.session.userId = user.user_id;
      req.session.username = user.user_name;
      success = 1;
    } else {
      err = 'User already exists';
    }
  } 
  res.json({status: success, msg: err});
  db.postAction(req.session.userId || 1, username, password, success, ACTIONS.signup);
  db.postAction(req.session.userId || 1, username, password, success, ACTIONS.signin);
})


app.get('/score', async (req, res) => {
  const userId = req.session.userId || 1;
  const score = await db.getScore(userId)
  res.json({score: score})
})

app.post('/score', async (req, res) => {
  const username = req.session.username || 'anon';
  const userId = req.session.userId || 1;
  const anon = username == 'anon';
  const { score, numProblems, gameMode } = req.body
  var gameNumber;
  if (req.session.gameNumber) {
    gameNumber = req.session.gameNumber + 1
  } else {
    gameNumber = await db.getGameNumber(userId) 
    gameNumber = gameNumber + 1
  }
  const result = await db.postScore(userId, username, gameNumber, anon, score, numProblems, gameMode)

  req.session.gameNumber = gameNumber
  res.send({status: 1, msg: false})
})

app.get('/statistic', async (req, res) => {
  const { userId } = req.body;
  statistics = await db.getStatistic(userId)
  res.json({statistics: statistics})

})

app.post('/statistic', async (req, res) => {
    // To be called after POST /score
  const username = req.session.username || 'anon';
  const userId = req.session.userId || 1;
  const anon = username == 'anon';
  const { problems, solutions, answers, times } = req.body;
  var gameNumber = req.session.gameNumber || await db.getGameNumber(userId);
  db.postStatistic(userId, gameNumber, anon, problems, solutions, answers, times)
  res.send({status: 1, msg: false})
})

app.post('/topscores', async (req, res) => {
  var { offset, limit, gameMode, ascending, date } = req.body
  date = getDate(date)
  var data;
  if (!date) {
    data = await db.getAllTopScores(offset, limit, gameMode, ascending)
  } else {
    data = await db.getTopScores(offset, limit, gameMode, ascending, date)
  }
  res.send({status: 1, data: data})
})

app.post('/perfectscores', async (req, res) => {
  var { offset, limit, gameMode, ascending, date } = req.body
  date = getDate(date)
  var data;
  if (!date) {
    data = await db.getAllPerfectScores(offset, limit, gameMode, ascending)
  } else {
    data = await db.getPerfectScores(offset, limit, gameMode, ascending, date)
  }
  res.send({status: 1, data: data})

})

app.post('/allscores', async (req, res) => {
  var { offset, limit, gameMode, ascending, date } = req.body
  date = getDate(date)
  var data;
  if (!date) {
    data = await db.getAllScores(offset, limit, gameMode, ascending)
  } else {
    data = await db.getScores(offset, limit, gameMode, ascending, date)
  }
  res.send({status: 1, data: data})

})

app.post('/overallrankings', async (req, res) => {
  var { offset, limit, gameMode, ascending, date} = req.body
  date = getDate(date)
  var data;
  if (!date) {
    data = await db.getAllAccuracies(offset, limit, gameMode, ascending)
  } else {
    data = await db.getAccuracies(offset, limit, gameMode, ascending, date)
  }
  console.log(data)
  res.json({status: 1, data: data})

})


app.post('/logout', (req, res) => {
  const userId = req.session.userId || 1
  const username = req.session.username || 'anon'
  req.session.destroy(err => {
    if (err) {
      db.postAction(userId, username, '', 0, ACTIONS.logout)
      return res.redirect('/home')
    }
    db.postAction(userId, username, '', 1, ACTIONS.logut)
    console.log('Session destroyed!')
    res.clearCookie(SESS_NAME)
    res.send({status: 1})
    res.end()
  })
})


app.listen(PORT, () => {
    console.log(`App started on PORT ${PORT}`);
});


