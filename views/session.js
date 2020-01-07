const path = '/session'

async function fetchSession() {


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

	let response = await fetch(path, {
		method: 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
	})
	let data = await response.json()
	if (data.status == 1) {
		username.style.display = 'none'
		password.style.display = 'none'
		remember.style.display = 'none'
		rememberlabel.style.display = 'none'
		signin.style.display = 'none'
		signup.style.display = 'none'
		profile.style.display = 'flex'
		logout.style.display = 'flex'
		usernamelabel.innerHTML = 'Hello ' + data.username + '!'
	} else {
		username.style.display = 'flex'
		password.style.display = 'flex'
		remember.style.display = 'flex'
		rememberlabel.style.display = 'flex'
		signin.style.display = 'flex'
		signup.style.display = 'flex'
		userform.style.display = 'flex'
	}
}

fetchSession()