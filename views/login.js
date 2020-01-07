

const userUrl = '/user'
const newUserUrl = '/newuser'
const sessionUrl = '/session'
const logoutUrl = '/logout'

async function submitSignIn() {
	var username = document.getElementById('username')
	var password = document.getElementById('password')
	var remember = document.getElementById('rememberbox')

	var postData = {'username': username.value, 'password': password.value}
	let response = await fetch(userUrl, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData)
	})
	let data = await response.json()
	if (data.status == 1) {
		fetchSession()
	} else {
		$('#signInModal').modal()
		document.getElementById('signin-modal-username').value = username.value
		document.getElementById('signin-modal-password').value = password.value
		document.getElementById('signin-modal-checkbox').checked = remember.checked
	}

}


async function submitSignUp() {
	var username = document.getElementById('username');
	var password = document.getElementById('password');
	var remember = document.getElementById('rememberbox');

	var postData = {'username': username.value, 'password': password.value}
	let response = await fetch(newUserUrl, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData)
	})
	let data = await response.json()
	if (data.status == 1) {
		fetchSession()
	} else {
		$('#signUpModal').modal()
		document.getElementById('signup-modal-username').value = username.value
		document.getElementById('signup-modal-password').value = password.value
		document.getElementById('signup-modal-checkbox').checked = remember.checked
	}
}

async function logout() {
	let response = await fetch(logoutUrl, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	let data = await response.json()
	if (data.status == 1) {
		toggleSignInOn()
	}
}

async function fetchSession() {
	let response = await fetch(sessionUrl, {
		method: 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	let data = await response.json()
	if (data.status == 1) {
		toggleSignInOff(data.username)
	} else {
		toggleSignInOn()
	}

}

function toggleSignInOn() {
	var username = document.getElementById('username')
	var password = document.getElementById('password')
	var remember = document.getElementById('rememberbox')
	var rememberlabel = document.getElementById('rememberlabel')
	var signin = document.getElementById('sign-in')
	var signup = document.getElementById('sign-up')
	var profile = document.getElementById('profile')
	var logout = document.getElementById('logout')
	var usernamelabel = document.getElementById('username-label')
	var userform = document.getElementById('user-form')

	username.value = ''
	password.value = ''
	username.style.display = 'flex'
	password.style.display = 'flex'
	remember.style.display = 'flex'
	rememberlabel.style.display = 'flex'
	signin.style.display = 'flex'
	signup.style.display = 'flex'
	userform.style.display = 'flex'
	profile.style.display = 'none'
	logout.style.display = 'none'
}

function toggleSignInOff(name) {
	var username = document.getElementById('username')
	var password = document.getElementById('password')
	var remember = document.getElementById('rememberbox')
	var rememberlabel = document.getElementById('rememberlabel')
	var signin = document.getElementById('sign-in')
	var signup = document.getElementById('sign-up')
	var profile = document.getElementById('profile')
	var logout = document.getElementById('logout')
	var usernamelabel = document.getElementById('username-label')

	username.style.display = 'none'
	password.style.display = 'none'
	remember.style.display = 'none'
	rememberlabel.style.display = 'none'
	signin.style.display = 'none'
	signup.style.display = 'none'
	profile.style.display = 'flex'
	logout.style.display = 'flex'
	usernamelabel.innerHTML = 'Hello ' + name + '!'
}


// High scores page

const topscoresURL = '/topscores'
const perfectscoresURL = '/perfectscores'
const allscoresURL = '/allscores'
const overallrankingsURL = '/overallrankings'

function toggleGameMode(mode) {
	var gameMode = document.getElementById('gameMode')
	gameMode.innerHTML = mode

}

function dateModeToDateTime(mode) {
	var datetime;
	switch (mode) {
		case 'today':
			datetime = 'today'
			break;
		case 'lastweek':
			datetime = 'week'
			break;
		case 'lastmonth':
			datetime = 'month'
			break;
		case 'lastyear':
			datetime = 'year'
			break;
		case 'alltime':
			datetime = false
			break;
		default:
			break;
	}
	return datetime
}

async function onToggleViewMode(switchMode) {
	var highscore = document.getElementById('highscore')
	if (!highscore) {
		return;
	}
	var scoreMode = document.getElementsByClassName('active score')[0].id
	var dateMode = document.getElementsByClassName('active date')[0].id
	var ascMode = document.getElementsByClassName('active asc')[0].id
	var gameMode = document.getElementById('gameMode').innerHTML.toLowerCase()
	var header;
	removeRows()
	removeHeader()
	switch (scoreMode) {
		case 'topscores':
			url = topscoresURL
			renderScores = renderTopScores
			header = ['Position', 'Username', 'Score', 'Problems']
			break;
		case 'perfectscores':
			url = perfectscoresURL
			renderScores = renderPerfectScores
			header = ['Position', 'Username', 'Score']
			break;
		case 'allscores':
			url = allscoresURL
			renderScores = renderTopScores
			header = ['Position', 'Username', 'Score', 'Problems']
			break;
		case 'overallrankings':
			url = overallrankingsURL
			renderScores = renderOverallRankings
			header = ['Power Ranking', 'Username', 'Top Score', 'Average Accuracy (%)']
			break;
		default:
			break;
		}
	// fetch data - POST request
	buildHeader(header)
	const offset = 0
	const limit = 0
	const date = dateModeToDateTime(dateMode)
	var data = await fetchScores(url, offset, limit, gameMode, ascMode === 'descending', date)
	const size = data.length
	// need offset, limit = 20 by default
	renderScores(data, offset, size, ascMode === 'ascending')
}

async function fetchScores(url, offset, limit, gameMode, ascMode, date) {
	const postData = {
		offset: offset, 
		limit: limit, 
		gameMode: gameMode, 
		ascending: ascMode,
		date: date,
	};
	const response = await fetch(url, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData),
	})

	let data = await response.json()
	if (data && data.status == 1){
		return data.data
	}
}

function renderTopScores(data, offset, size, ascending) {
	var highscore = document.getElementById('highscore')
	if (!highscore) {
		return;
	}
	var table = document.getElementById('highscores-table')
	var position, username, scores, problems

	
	for (var i = 0; i < data.length; i++) {
		if (ascending) {
			position = offset + 1 + i
		} else {
			position = size - i
		}
		username = data[i].name
		score = data[i].score
		problem = data[i].num_problems

		row = buildRow([position, username, score, problem])
		table.appendChild(row)
	}
}

function renderPerfectScores(data, offset, size, ascending) {
	var highscore = document.getElementById('highscore')
	if (!highscore) {
		return;
	}
	var table = document.getElementById('highscores-table')

	var position, username, scores
	
	for (var i = 0; i < data.length; i++) {
		if (ascending) {
			position = offset + 1 + i
		} else {
			position = size - i
		}
		username = data[i].name
		score = data[i].score
		row = buildRow([position, username, score])
		table.appendChild(row)

	}	
}

function renderOverallRankings(data, offset, size, ascending) {
	var highscore = document.getElementById('highscore')
	if (!highscore) {
		return;
	}
	var table = document.getElementById('highscores-table')

	var position, username, scores, problems
	
	for (var i = 0; i < data.length; i++) {
		if (ascending) {
			position = offset + 1 + i
		} else {
			position = size - i
		}
		username = data[i].name
		score = data[i].topscore
		accuracy = data[i].accuracy
		row = buildRow([position, username, score, accuracy])
		table.appendChild(row)
	}
	
}

function removeRows() {
	var table = document.getElementById('highscores-table');
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
}	

function buildRow(rowData) {
	const row = document.createElement('tr');
	var col;
	for (var i = 0; i < rowData.length; i++) {
		col = document.createElement('td')
		if (i == 1) {
			col.class = 'username'
		}
		col.innerHTML = rowData[i]
		row.appendChild(col)
	}
	return row
}

function buildHeader(rowData) {
	const header = document.getElementById('headRow')
	var col;
	for (var i = 0; i < rowData.length; i++) {
		col = document.createElement('th')
		col.innerHTML = rowData[i]
		col.scope = "col"
		header.appendChild(col)
	}
	return header
}

function removeHeader() {
	var header = document.getElementById('headRow');
	while (header.firstChild) {
		header.removeChild(header.firstChild)
	}
}

function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}    

function searchUser() {
	const username = document.getElementById('searchbar')
	if (!username.value) {
		return;
	}
	const table = document.getElementById('highscores-table')
	while (table.firstChild) {
		if (table.firstChild.childNodes[1].innerHTML === username.value) {
			break
		}
		table.removeChild(table.firstChild)
	}
}
// Script execution
fetchSession()
onToggleViewMode()

