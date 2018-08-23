/* Script that runs to setup canvas for gameplay */

/* gameArea contains the entire game area
   canvas - the canvas used to draw the game area
   build - function which builds the canvas
   clear - function which clears the canvas

*/

var currentInput = "";


function generateList(number) {
	var dict = new Object();
	for (i = 1; i < number + 1; i++) {
        for (j = 1; j < number + 1; j++) {
        	dict[i.toString() + " × " + j.toString()] = i * j;
        }
	}
	return dict;
}

var dict = generateList(16);
var setList = [];

for (var key in dict) {
	setList.push(key);
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

setList = shuffle(setList);
copiedList = Array.from(setList);


var myCanvas = document.getElementById("gameArea");

var gameArea = {
	canvas : myCanvas, 
	context : myCanvas.getContext("2d"),
	started : false,
	score : 0,
	numProblems : 0,
	currentProblem : "",
	listOfProblems : {},
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

	}
}

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
		gameArea.context.fillStyle = "rgb(200, 0, 100)";
		gameArea.context.fillRect(startXh, 0 , width, height);
		gameArea.context.fillRect(canvas.width - width - startXh, canvas.height - width, width, height);
		gameArea.context.fillRect(canvas.width - width, startYv, width, height);
		gameArea.context.fillRect(0, canvas.height - height - startYv, width, height);
	}

	var step = function() {
		update();
		draw();
		if(!gameArea.started) {
			window.requestAnimationFrame(step);
		} else {
			gameArea.clear();
			startGame();
		}
	}

	var constructStart = function() {
		gameArea.constructBlock("Start", 200, 100, "rgb(200, 0 , 0)", "rgb(0, 0, 0)", "30px Arial", (canvas.width - 200)/2, (canvas.height - 100)/2, canvas.width/2 + 2, canvas.height/2 + 13);
	}

	step();
}

function drawCount(duration, color) {
	gameArea.constructBlock(duration, 200, 100, color, "rgb(0, 0, 0)", "30px Arial",
		(gameArea.canvas.width - 200)/2, (gameArea.canvas.height - 100)/2, 
		gameArea.canvas.width/2, gameArea.canvas.height/2 + 10);
}


/** timer keeps track of time and initializes game **/
var timer = {
	duration : 60.00,
	drawTime : function(timeRemaining) { 
		gameArea.constructBlock(timeRemaining, 200, 100, "#f1f1f1", "rgb(0,0,0)", "30px Arial", (gameArea.canvas.width - 200)/2 - 357, (gameArea.canvas.height - 100)/2 - 270, gameArea.canvas.width/2 - 357, gameArea.canvas.height/2 - 270);
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
		diff = (new Date().getTime() - start) - time;
		if (duration < 0) {
			timer.drawTime("Done!");
			document.removeEventListener('keydown', constructInput);
			console.log(gameArea.score);
		} else {
			time += 10;
			window.setTimeout(counter, 10 - diff);
		}
	}
	counter();
}

function displayProblem() {
	if (setList.length == 0) {
		setList = Array.from(copiedList);
	}
	var problem = setList.pop();
	gameArea.currentProblem = problem;
	gameArea.clear();
	gameArea.constructBlock(problem, 300, 200, "#f1f1f1", "rgb(0,0,0)", "60px Arial", (gameArea.canvas.width - 200)/2, (gameArea.canvas.height - 100)/2, gameArea.canvas.width/2, gameArea.canvas.height/2 - 100);
}

var constructInput = function(event) {
	var canvas = gameArea.canvas;
	if (event.key == "Enter") {
		if (dict[gameArea.currentProblem] == parseInt(currentInput)) {
			gameArea.score += 1;
		}
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
	drawGame();
}

function clickCanvas(event) {
	var canvas = gameArea.canvas;
	var x = event.pageX - gameArea.canvas.offsetLeft,
		y = event.pageY - gameArea.canvas.offsetTop;
	if (x > (canvas.width - 200)/2 && x < (canvas.width - 200)/2 + 200 && 
		y > (canvas.height - 100)/2 && y <(canvas.height - 100)/2 + 100) {
		removeStartButton();
		gameArea.started = true;
	}

}
function startButton() {
	gameArea.canvas.addEventListener('click', clickCanvas, false);
}

function removeStartButton() {
	gameArea.canvas.removeEventListener('click', clickCanvas);
}
/** Running the game **/
function runGame() {

	var canvas = gameArea.canvas;
	startButton();
	startMenu(canvas);


}

runGame();


