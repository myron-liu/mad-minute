const mysql = require('mysql2');
const util = require('util');
const config = require('./config')
// Database handling

function runDatabase(environment) {
  var pool
  if (environment === 'dev') {
    var pool = mysql.createPool({
      connectionLimit: 100,
       host: config.database.host,
      user: config.database.user,
      port: config.database.port,
      password: config.database.password,
      database: config.database.database, 
      debug: true,
    })
  } else if  (environment === 'prod') {
    var pool = mysql.createPool({
      connectionLimit: 100,
      host: config.database.host,
      user: config.database.user,
      port: config.database.port,
      password: config.database.password,
      database: config.database.database,
      debug: false,
    })

  }
	return new Database(pool)
}

class Database {
  constructor(pool) {
    this.pool = pool.promise()
  }

  async getUser(username) {
    const sql = `SELECT * FROM users WHERE user_name = '${username}';`;
    const result = await this.pool.query(sql)
    if (result[0].length == 0) {
    	return null
    } else {
    	return result[0][0]
    }
  }

  async getScore(userId) {
    const sql = `SELECT user_id, game_number, score, num_problems, game_mode, name, timestamp FROM user_scores WHERE user_id=${userId};`;
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getStatistic(userId) {
    const sql = `SELECT user_id, game_number, problem, solution, answer, time, timestamp FROM user_statistics WHERE user_id=${userId};`;
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAllScores() {
    const sql = `SELECT game_number, score, num_problems, game_mode, name, timestamp FROM user_scores;`;
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAllStatistics() {
    const sql = `SELECT game_number, problem, solution, answer, time, timestamp FROM user_statistics;`;
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getGameNumber(userId) {
    const sql = `SELECT 
    				CASE
    					WHEN game_number is NULL THEN 0
    					ELSE game_number
    				END AS game_number
    			FROM (SELECT MAX(game_number) as game_number FROM user_scores WHERE user_id=${userId}) AS game_numbers;`;
    const result = await this.pool.query(sql)
    return result[0][0].game_number
  }

  async postUser(username, password) {
    const sql = `INSERT INTO users(user_name, user_password) VALUES ('${username}','${password}');`;
    const result = await this.pool.query(sql)
    return result
  }

  async postScore(userId, username, gameNumber, anon, score, numProblems, gameMode) {
    const sql = `INSERT INTO user_scores(user_id, game_number, anon, score, num_problems, game_mode, name) 
                 VALUES (${userId},${gameNumber},${anon},${score},${numProblems},'${gameMode}','${username}');`;
    const result = await this.pool.query(sql)
    return result
  }

  async postStatistic(userId, gameNumber, anon, problems, solutions, answers, times) {
    var sql = ["INSERT INTO user_statistics(user_id, game_number, anon, problem, solution, answer, time) VALUES "]
    var problem, solution, answer, time;
    for (var i = 0; i < problems.length; i++) {
      problem = problems[i], solution = solutions[i], answer = answers[i], time = times[i];
      if (i != 0) {
      	sql.push(',')
      }
      sql.push(`(${userId},${gameNumber},${anon},'${problem}','${solution}','${answer}',${time})`);
    }
    sql.push(';')
    sql = sql.join('');

    const result = await this.pool.query(sql)
    return result
  }

  async postAction(userId, username, password, success, action) {
    const sql = `INSERT INTO user_logs(user_id, user_name, user_password, success, action) VALUES
    (${userId},'${username}','${password}', ${success},'${action}');`
    const result = await this.pool.query(sql)
    return result
	}

  async getAllTopScores(offset, limit, gameMode, ascending) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT DISTINCT c.user_id, c.score, c.num_problems, c.name FROM
    (SELECT user_id, score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}') AS c JOIN
    (SELECT a.user_id, a.score, MIN(a.num_problems) AS num_problems FROM 
    (SELECT user_id, score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}') AS a JOIN 
    ( SELECT user_id, MAX(score) AS score FROM user_scores WHERE game_mode = '${gameMode}' GROUP BY user_id) AS b ON a.score = b.score 
    AND a.user_id = b.user_id GROUP BY a.user_id, a.score) AS d 
    ON c.user_id = d.user_id AND c.score = d.score AND c.num_problems = d.num_problems
    ORDER BY c.score ${asc}, num_problems ASC`
    console.log(sql)
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getTopScores(offset, limit, gameMode, ascending, date) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT DISTINCT c.user_id, c.score, c.num_problems, c.name FROM
    (SELECT user_id, score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}' AND timestamp > ${date}) AS c JOIN
    (SELECT a.user_id, a.score, MIN(a.num_problems) AS num_problems FROM 
    (SELECT user_id, score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}') AS a JOIN 
    ( SELECT user_id, MAX(score) AS score FROM user_scores WHERE game_mode = '${gameMode}' AND timestamp > ${date} GROUP BY user_id) AS b ON a.score = b.score 
    AND a.user_id = b.user_id GROUP BY a.user_id, a.score) AS d 
    ON c.user_id = d.user_id AND c.score = d.score AND c.num_problems = d.num_problems
    ORDER BY c.score ${asc}, num_problems ASC`
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAllPerfectScores(offset, limit, gameMode, ascending) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT score, game_mode, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}' AND score > 0 and
                  user_scores.num_problems = user_scores.score ORDER BY user_scores.score ${asc};`
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getPerfectScores(offset, limit, gameMode, ascending, date) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT score, game_mode, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}' AND timestamp > ${date} AND score > 0 and
                  user_scores.num_problems = user_scores.score ORDER BY user_scores.score ${asc};`
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAllScores(offset, limit, gameMode, ascending) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}' AND score > 0
            ORDER BY score ${asc}, num_problems ASC`
    const result = await this.pool.query(sql)
    return result[0]
  }

    async getScores(offset, limit, gameMode, ascending, date) {
    const asc = ascending ? 'ASC' : 'DESC'
    const sql = `SELECT score, num_problems, name, timestamp FROM user_scores WHERE game_mode = '${gameMode}' AND timestamp > ${date} AND score > 0
            ORDER BY score ${asc}, num_problems ASC`
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAllAccuracies(offset, limit, gameMode, ascending) {
    const asc = ascending ? 'ASC' : 'DESC'
      const sql = `SELECT MAX(score) AS topscore, ROUND(AVG(score / num_problems),2) * 100 AS accuracy, name FROM user_scores WHERE game_mode = '${gameMode}' AND num_problems > 0
            GROUP BY name ORDER BY topscore ${asc}, accuracy DESC;`
    const result = await this.pool.query(sql)
    return result[0]
  }

  async getAccuracies(offset, limit, gameMode, ascending, date) {
    const asc = ascending ? 'ASC' : 'DESC'
      const sql = `SELECT MAX(score) AS topscore, ROUND(AVG(score / num_problems),2) * 100 AS accuracy, name FROM user_scores 
            WHERE game_mode = '${gameMode}' AND num_problems > 0 AND timestamp > ${date} GROUP BY name ORDER BY topscore ${asc}, accuracy DESC;`
    const result = await this.pool.query(sql)
    return result[0]
  }

}



  // delete account

  // email handling for recovery?

  // classroom hosting

exports.runDatabase = runDatabase;
