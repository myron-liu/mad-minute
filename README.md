# Mad Minute

Hello there! My name is Myron and this is my multiplication web app game. This game was introduced to me by my primary school teacher Ms Bowden where you try and answer as many multiplication problems in one minute as possible. Her version was a sheet of paper with randomly arranged multiplication problems numbered 1 through 144 and should she would randomly call out a number to start the challenge. How many can you answer in under a minute?

This version has three modes: easy, medium, and hard. Easy mode goes up to 10 times tables, medium mode goes up to 12 times tables, and hard mode goes up to 16 times tables. There is also a practice mode and classroom contest mode which lets you compete with other users that are logged in as well as host your own competitions. You can view your statistics in the statistics tab as well the your high scores along with other people's high scores in the high scores tab.

Originally, this project was my first introduction to HTML, CSS, and Javascript. 3 years later, I have reworked this project by adding in more features including a Node backend with a MySQL database for storage and a Redis client for session storage. I also learned a lot more this time around by exploring the best practices in API design and resource management as well as MVC. I reworked it as a React app as well. Below is an outline of the resources in the project.

Building this project was very iterative and at times it meant reworking all the files but I am happy with how this project has turned out.

## Resources

'/'

GET - returns landing page

'/home'

GET - returns home page

'/highscores'

GET - returns high scores page

'/statistics'

GET - returns statistics page

'/contact'

GET - returns contact page

'/session'

GET - returns current session

'/user': users table

GET - returns {user_id, username,  password} (Used for user sign in)
POST - inserts {user_id, username, password} (Used for user sign up)
DELETE - deletes {user_id} (Used for user deletion)

'/statistic': user_statistics table

GET - returns list of statistics for a particular user_id {game_number, problem, solution, answer, time, timestamp}
PUT - inserts statistics for a particular user_id and game{user_id, game_number, anon, problem, solution, answer, time}

'/allstatistics':

GET - returns all statistics {game_number, problem, solution, answer, time, timestamp}

'/gamenumber': user_scores table

GET - returns the current game number of a particular user {game_number}

'/score': user_scores table

GET - returns list of scores for a particular user_id {game_number, score, num_problems, game_mode, name, timestamp}
PUT - inserts a score for a particular user and game {user_id, game_number, anon, score, num_problems, game_mode, name}

'/allscores': user_scores table

GET - returns list of all scores {game_number, score, num_problems, game_mode, name}

## Tables

##### users
##### user_scores
##### user_statistics
##### user_logs (Note this table is used for tracking user interaction with the application interface; logouts, logins, signups, and deletes)


