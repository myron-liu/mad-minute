/* Script that runs to setup canvas for gameplay */

/* gameArea contains the entire game area
   canvas - the canvas used to draw the game area
   build - function which builds the canvas
   clear - function which clears the canvas

*/

var currentInput = ""

function generateList(number) {
	var dict = new Object();
	if (typeof number != 'number') {
		for (x of number) {
			for (j = 1; j <= 16; j++) {
				dict[x.toString() + " × " + j.toString()] = x * j;
			}
		}
		for (j = 1; j <= 16; j++) {
			for (x of number) {
				dict[j.toString() + " × " + x.toString()] = x * j;
			}
		}
		return dict;
	}
	for (i = 1; i < number + 1; i++) {
        for (j = 1; j < number + 1; j++) {
        	dict[i.toString() + " × " + j.toString()] = i * j;
        }
	}
	return dict;
}


/** Taken from Knuth shuffle - https://github.com/coolaj86/knuth-shuffle **/
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

var myCanvas = document.getElementById("gameArea");

const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
var gameArea = {
	canvas : myCanvas, 
	context : myCanvas.getContext("2d"),
	mode : 'easy',
	started : false,
	score : 0,
	highscore : 0,
	numProblems : 0,
	currentProblem : "",
	solutions : {},
	listOfProblems : [],
	answers : [],
	problems : [],
	currentInput : "",
	practice : false,
	practiceNumbers: numbers.map(num => false),
	saved: false,
	times : [],
	mousePosition : {
		x: null,
		y: null,
	},
	clear : function() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	start : function() {
		this.started = true;
	},
	constructBlock : function(text, width, height, color, textColor, textFont, x, y, textX, textY) {
		this.context.clearRect(x, y, width, height);
		this.context.fillStyle = color;
		this.context.fillRect(x, y, width, height);
		this.context.fillStyle = textColor;
		this.context.font = textFont;
		this.context.textAlign = "center";
		this.context.fillText(text, textX, textY);
	},
	constructBox : function(text, width, height, color, textColor, textFont, x, y, textX, textY) {
		this.context.clearRect(x, y, width, height);
		this.context.strokeStyle = color
		this.context.strokeRect(x, y, width, height);
		this.context.fillText(text, textX, textY)
		this.context.font = textFont
	},
	reset : function() {
		gameArea.score = 0
		gameArea.numProblems = 0
		gameArea.currentProblem = ""
		gameArea.currentInput = ""
		gameArea.listOfProblems = []
		gameArea.solutions = {}
		gameArea.problems = []
		gameArea.answers = []
		gameArea.times = []
		gameArea.saved = false
		currentInput = ""
	}
}

// Buttons

function makeButton(button) {
	function onPressButton(event) {
		var x = event.pageX - gameArea.canvas.offsetLeft,
		y = event.pageY - gameArea.canvas.offsetTop;

		if ((x > button.x && x < button.x + button.width) && (y > button.y && y < button.y + button.height)) {
			button.onPress()
		}
	}
	return onPressButton
}

var buttons = {
	start: {
		text: 'Start',
		width: 180,
		height: 75,
		color: 'rgb(200,200,200)',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/2 - 90,
		y: (myCanvas.height)/2 - 35,
		textX: myCanvas.width/2,
		textY: myCanvas.height/2 + 15,
		active: false,
		activate: () => {
			myCanvas.addEventListener('click', onPressStart, false);
			buttons.start.active = true
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressStart)
			buttons.start.active = false
		},
		onPress: () => {
			buttons.start.deactivate()
			buttons.easy.deactivate()
			buttons.medium.deactivate()
			buttons.hard.deactivate()
			buttons.practice.deactivate()
			buttons.number.deactivate()
			gameArea.started = true
		},
	},
	retry: {
		text: 'Retry',
		width: 180,
		height: 75,
		color: 'rgb(200,0,0)',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/2 - 90,
		y: (myCanvas.height)/2 - 40,
		textX: myCanvas.width/2 + 3,
		textY: myCanvas.height/2 + 10,
		activate: () => {
			myCanvas.addEventListener('click', onPressRetry, false);
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressRetry)
			myCanvas.removeEventListener('click', onPressMainMenu)
		},
		onPress: () => {
			startMenu(myCanvas);
			buttons.retry.deactivate()
			gameArea.reset()
			gameArea.started = true
		},
	},
	mainMenu: {
		text: 'Main Menu',
		width: 180,
		height: 75,
		color: 'rgb(200,0,0)',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/2 - 90,
		y: (myCanvas.height)/2 + 70,
		textX: myCanvas.width/2 + 3,
		textY: myCanvas.height/2 + 120,
		activate: () => {
			myCanvas.addEventListener('click', onPressMainMenu, false);

		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressRetry)
			myCanvas.removeEventListener('click', onPressMainMenu)
		},
		onPress: () => {
			buttons.mainMenu.deactivate();
			gameArea.reset()
			buttons.start.activate()
			startMenu(myCanvas);
			gameArea.started = false;
			gameArea.practice = false;
			gameArea.mode = 'easy'
		},
	},
	easy: {
		text: 'Easy',
		width: 150,
		height: 50,
		color: '#00EE00',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/4 - 25,
		y: (myCanvas.height)/4,
		textX: 250,
		textY: 185,
		activate: () => {
			myCanvas.addEventListener('click', onPressEasy, false);
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressEasy)
		},
		onPress: () => {
			gameArea.mode = 'easy'
		},
	},
	medium: {
		text: 'Medium',
		width: 150,
		height: 50,
		color: '#FEAF2C',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/4 + 125,
		y: (myCanvas.height)/4,
		textX: 400,
		textY: 185,
		activate: () => {
			myCanvas.addEventListener('click', onPressMedium, false);
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressMedium)
		},
		onPress: () => {
			gameArea.mode = 'medium'
		},
	},
	hard: {
		text: 'Hard',
		width: 150,
		height: 50,
		color: '#F60000',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width)/4 + 275,
		y: (myCanvas.height)/4,
		textX: 550,
		textY: 185,
		activate: () => {
			myCanvas.addEventListener('click', onPressHard, false);
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressHard)
		},
		onPress: () => {
			gameArea.mode = 'hard'
		},
	},
	practice: {
		text: 'Practice',
		width: 180,
		height: 75,
		color: '#0090FF',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: (myCanvas.width/2) - 90,
		y: (myCanvas.height/2) + 75,
		textX: (myCanvas.width/2),
		textY: (myCanvas.width/2) + 25,
		activate: () => {
			myCanvas.addEventListener('click', onPressPractice, false);
		},
		deactivate: () => {
			myCanvas.removeEventListener('click', onPressPractice)
		},
		onPress: () => {
			if (gameArea.practice) {
				buttons.easy.activate()
				buttons.medium.activate()
				buttons.hard.activate()
				buttons.number.deactivate()
			} else {
				buttons.easy.deactivate()
				buttons.medium.deactivate()
				buttons.hard.deactivate()
				buttons.number.activate()
			}
			gameArea.practice = !gameArea.practice
			if (gameArea.practice) {
				gameArea.mode = 'practice'
			} else {
				gameArea.mode = 'easy'
			}
		}
	},
	number: {
		text: 0,
		width: 50,
		height: 50,
		color: '#0090FF',
		textColor: 'rgb(0,0,0)',
		textSize: '30px Arial',
		x: 200,
		y: 100,
		textX: 225,
		textY: 135,
		activate: () => {
			for (num of numbers) {
				myCanvas.addEventListener('click', onPressNumbers[num - 1], false);
			}
		},
		deactivate: () => {
			for (num of numbers) {
				myCanvas.removeEventListener('click', onPressNumbers[num - 1], false);
			}
		}
	},
	numbers: []
}
function makeNumberButton(num) {
	function onPress() {
		gameArea.practiceNumbers[num - 1] = !gameArea.practiceNumbers[num - 1]
	}
	return onPress;
}

for (num of numbers) {
	number = {
		text: num,
		width: buttons.number.width,
		height: buttons.number.height,
		color: buttons.number.color,
		textColor: buttons.number.textColor,
		textSize: buttons.number.textSize,
		x: buttons.number.x + ((num - 1) % 8) * buttons.number.width,
		y: buttons.number.y + (Math.floor((num - 1) / 8)) * buttons.number.height,
		textX: buttons.number.textX + ((num - 1) % 8) * buttons.number.width,
		textY: buttons.number.textY + (Math.floor((num - 1) / 8)) * buttons.number.height,
		onPress: makeNumberButton(num),
	}
	buttons.numbers.push(number)
}




var onPressStart = makeButton(buttons.start)
var onPressRetry = makeButton(buttons.retry)
var onPressMainMenu = makeButton(buttons.mainMenu)
var onPressEasy = makeButton(buttons.easy)
var onPressMedium = makeButton(buttons.medium)
var onPressHard = makeButton(buttons.hard)
var onPressPractice = makeButton(buttons.practice)
var onPressNumbers = buttons.numbers.map(num => makeButton(num))

/** startMenu animations **/
var startMenu = function(canvas) {
	var hspeed = 4;
	var vspeed = canvas.height / (gameArea.canvas.width/hspeed);
	var startXh = -hspeed;
	var startYh = -hspeed;
	var startXv = -vspeed;
	var startYv = -vspeed;
	var width = 20;
	var height = 20;

	var update = function() {
		/** Reset the animation **/
		if (startXh + hspeed > canvas.width - width || startYv + vspeed > canvas.height - height) {
			startXh = -hspeed;
			startYv = -vspeed;
		}
		startXh = startXh + hspeed;
		startYv = startYv + vspeed;
	}

	var draw = function() {
		gameArea.clear();
		constructStart();
		constructModes();
		constructPractice();
		constructGrid()

		gameArea.context.fillStyle = "rgb(200, 0, 100)";
		gameArea.context.fillRect(startXh, 0 , width, height);
		gameArea.context.fillRect(canvas.width - width - startXh, canvas.height - width, width, height);
		gameArea.context.fillRect(canvas.width - width, startYv, width, height);
		gameArea.context.fillRect(0, canvas.height - height - startYv, width, height);
	}

	var step = function() {
		update();
		draw();
		if (gameArea.practice) {
			if (buttons.start.active &&(gameArea.practiceNumbers.reduce((a, b) => a + b, 0) == 0)) {
				buttons.start.deactivate()
		} else {
			buttons.start.activate()
		}
	}
		if(!gameArea.started) {
			window.requestAnimationFrame(step);
		} else {
			gameArea.clear();
			startGame();
		}
	}

	var constructStart = function() {
		//var start = animateButton(buttons.start, gameArea.constructBlock)
		drawButton(buttons.start, true)
		
	}

	var constructModes = function() {
		drawButton(buttons.easy, gameArea.mode == 'easy', gameArea.practice)
		drawButton(buttons.medium, gameArea.mode == 'medium', gameArea.practice)
		drawButton(buttons.hard, gameArea.mode == 'hard', gameArea.practice)
		if (!gameArea.practice) {
			buttons.easy.activate()
			buttons.medium.activate()
			buttons.hard.activate()
		}

	}

	var constructPractice = function() {
		drawButton(buttons.practice, gameArea.practice)
	}

	var constructGrid = function() {
		for (button of buttons.numbers) {
			drawButton(button, gameArea.practiceNumbers[button.text - 1], !gameArea.practice)
		}
	}
	buttons.practice.activate()
	buttons.start.activate()
	
	gameArea.score = 0
	gameArea.numProblems = 0
	step();
}

function drawButton(button, selectedMode, practice) {
	if (practice) {
		return
	}
	if (selectedMode) {
		gameArea.constructBlock(button.text, button.width, button.height, button.color, button.textColor, button.textSize, button.x, button.y, button.textX, button.textY)
	} else {
		gameArea.constructBox(button.text, button.width, button.height, button.color, button.textColor, button.textSize, button.x, button.y, button.textX, button.textY)
	}
}


function generateProblems(mode) {
	switch (mode) {
		case 'easy':
			gameArea.solutions = generateList(10)
			break;
		case 'medium':
			gameArea.solutions = generateList(12)
			break;
		case 'hard':
			gameArea.solutions = generateList(16)
			break;
		case 'practice':
			gameArea.solutions = generateList(numbers.filter((item, i) => gameArea.practiceNumbers[i]))
			break;
		default:
			break;
	}
	var setList = []
	for (var key in gameArea.solutions) {
		setList.push(key)
	}
	return shuffle(setList)
}

function drawCount(duration, color) {
	gameArea.constructBlock(duration, buttons.start.width, buttons.start.height, color, "rgb(0, 0, 0)", "30px Arial",
		buttons.start.x, buttons.start.y, 
		buttons.start.textX, buttons.start.textY);
}


/** timer keeps track of time and initializes game **/
var timer = {
	duration : 60.00,
	drawTime : function(timeRemaining) { 
		var color = 'rgb(0,0,0)'
		if (timeRemaining < 10.0) {
			color = 'rgb(255,0,0)'
		}
		gameArea.constructBlock(timeRemaining, 200, 100, "#f1f1f1", color, "30px Arial", (gameArea.canvas.width - 200)/2 - 357, (gameArea.canvas.height - 100)/2 - 270, gameArea.canvas.width/2 - 357, gameArea.canvas.height/2 - 270);
	
	},	
	countdown : function(duration) {
		var start = Date.now(), time = 0, diff, playing = false;
		function counting() {
			if (!playing) {
				this.drawCount(duration, "rgb(200, 200, 0)");
				duration = duration - 1;
				diff = (new Date().getTime() - start) - time;
				if (duration < 0) {
					this.drawCount("Go!", "rgb(0, 200, 0)");
					playing = true;
					window.setTimeout(counting, 1000 - diff);
				} else {
					time += 1000;
					window.setTimeout(counting, 1000 - diff);
				}
			} else {
				playGame();
			}
		}
		counting();
	}
}

function drawGame() {
	var start = Date.now(), time = 0, diff;
	var duration = 60.00;
	function counter() {
		timer.drawTime((Math.round(duration*100)/100).toFixed(2));
		duration = duration - 0.01;
		displayScore();
		diff = (new Date().getTime() - start) - time;
		if (duration < 0) {
			gameArea.clear()
			gameArea.highscore = Math.max(gameArea.highscore, gameArea.score)
			displayEnd();
			timer.drawTime("Done!");
			if (!gameArea.saved) {
				recordPerformance()
				gameArea.saved = true
			}
			document.removeEventListener('keydown', constructInput);
		} else {
			time += 10;
			window.setTimeout(counter, 10 - diff);
		}
	}
	counter();
}

function displayProblem() {
	if (gameArea.listOfProblems.length == 0) {
		gameArea.listOfProblems = generateProblems(gameArea.mode);
	}
	var problem = gameArea.listOfProblems.pop();
	gameArea.currentProblem = problem;
	gameArea.clear();
	gameArea.constructBlock(problem, 300, 200, "#f1f1f1", "rgb(0,0,0)", "60px Arial", (gameArea.canvas.width - 200)/2, (gameArea.canvas.height - 100)/2, gameArea.canvas.width/2, gameArea.canvas.height/2 - 100);
}

function displayScore() {
	gameArea.constructBlock(gameArea.score, 0, 0, "#f1f1f1", "rgb(0,0,0)", "60px Arial", (gameArea.canvas.width - 100), 0, gameArea.canvas.width - 50, 50)
}

function displayEnd() {
	var endMessage = 'You answered ' + gameArea.score + ' out of ' + gameArea.numProblems + ' correctly!'
	gameArea.constructBlock(endMessage, 0, 0, "#f1f1f1", "rgb(0,0,0)", "35px Arial", (gameArea.canvas.width - 200)/2, (gameArea.canvas.height - 50)/2, gameArea.canvas.width/2, gameArea.canvas.height/2 - 150)
	var highScore = 'Current high score: ' + Math.max(gameArea.score, gameArea.highscore)
	gameArea.constructBlock(highScore, 0, 0, "#f1f1f1", "rgb(0,0,0)", "35px Arial", (gameArea.canvas.width)/2, (gameArea.canvas.height - 50)/2 + 100, gameArea.canvas.width/2, gameArea.canvas.height/2 - 100)
	
	var retry = buttons.retry
	var mainMenu = buttons.mainMenu
	gameArea.started = false
	retry.activate()
	mainMenu.activate()
	gameArea.constructBlock(retry.text, retry.width, retry.height, retry.color, retry.textColor, retry.textSize, retry.x , retry.y, retry.textX, retry.textY)
	gameArea.constructBlock(mainMenu.text, mainMenu.width, mainMenu.height, mainMenu.color, mainMenu.textColor, mainMenu.textSize, mainMenu.x, mainMenu.y, mainMenu.textX, mainMenu.textY)
}

var constructInput = function(event) {
	var canvas = gameArea.canvas;
	if (event.key == "Enter") {
		if (gameArea.solutions[gameArea.currentProblem] == parseInt(currentInput)) {
			gameArea.score += 1;
		}
		var newTimestamp = Date.now()

		gameArea.times.push((newTimestamp - gameArea.currentTimestamp)/1000)
		gameArea.currentTimestamp = newTimestamp
		gameArea.answers.push(currentInput || 'skipped')
		gameArea.problems.push(gameArea.currentProblem)
		gameArea.listOfProblems[gameArea.currentProblem] = parseInt(currentInput);
		gameArea.numProblems += 1;
		displayProblem();
		currentInput = "";
		gameArea.constructBlock(currentInput, 180, 60, "rgb(255, 255 , 255)", "rgb(0, 0, 0)", "30px Arial", (canvas.width - 180)/2, (canvas.height - 60)/2, canvas.width/2 + 2, canvas.height/2 + 13);
	} else if (event.keyCode == 8) {
		if (currentInput.length > 0) {
			currentInput = currentInput.slice(0, -1);
			gameArea.constructBlock(currentInput, 180, 60, "rgb(255, 255 , 255)", "rgb(0, 0, 0)", "30px Arial", (canvas.width - 180)/2, (canvas.height - 60)/2, canvas.width/2 + 2, canvas.height/2 + 13);
		}
	} else if (event.keyCode >= 48 && event.keyCode <= 57) {
		if (currentInput.length > 9) {
			return;
		} else {
			currentInput += event.key;
			gameArea.constructBlock(currentInput, 180, 60, "rgb(255, 255 , 255)", "rgb(0, 0, 0)", "30px Arial", (canvas.width - 180)/2, (canvas.height - 60)/2, canvas.width/2 + 2, canvas.height/2 + 13);
		}
	}
}


/** playing mode for the game **/


function startGame() {
	timer.countdown(3);
}

function playGame() {
	gameArea.clear();
	displayProblem();
	var canvas = gameArea.canvas;
	gameArea.constructBlock("", 180, 60, "rgb(255, 255 , 255)", "rgb(0, 0, 0)", "30px Arial", (canvas.width - 180)/2, (canvas.height - 60)/2, canvas.width/2 + 2, canvas.height/2 + 13);
	document.addEventListener('keydown', constructInput, false);
	gameArea.currentTimestamp = Date.now()
	drawGame();
}



/** Running the game **/
function runGame() {

	var canvas = gameArea.canvas;
	startMenu(canvas);
}

runGame();

const scoreUrl = '/score'
/** API calls for storing information **/
async function recordPerformance() {
	var solutions = []
	for (var i = 0; i < gameArea.problems.length; i++) {
		solutions.push(gameArea.solutions[gameArea.problems[i]])
	}
	let scorePostData = {
		score: gameArea.score, 
		numProblems: gameArea.numProblems, 
		gameMode: gameArea.mode,
		problems: gameArea.problems,
		solutions: solutions,
		answers: gameArea.answers,
		times: gameArea.times,
	}
	let data = await fetch(scoreUrl, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(scorePostData)
	})

}