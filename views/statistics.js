
overallStatisticsURL = '/overallstatistics'
lastScoresURL = '/lastscores'
lastStatisticsURL = '/laststatistics'
userStatisticsURL = '/userstatistics'

// helpers
function getGameMode(mode) {
	var gameMode;
	switch (mode) {
		case 'all statistics':
			gameMode = false;
			break;
		case 'easy statistics':
			gameMode = 'easy';
			break;
		case 'medium statistics':
			gameMode = 'medium';
			break;
		case 'hard statistics':
			gameMode = 'hard';
			break;
		default:
			break;
	}
	return gameMode
}

function getStatsMode(mode) {
	var statsMode;
	switch (mode) {
		case 'globalstatistics':
			statsMode = false;
			break;
		case 'yourstatistics':
			statsMode = true;
			break;
		default:
			break;
	}
	return statsMode;
}

function computeStandardDeviation(data, average) {
	var sd = 0;
	for (var i = 0; i < data.length; i++) {
		sd += Math.pow(data[i] - average, 2)
	}
	sd /= data.length
	return Math.round(Math.sqrt(sd) * 100)/100
}


// rendering functions
function renderStatistics() {
	d3.select("svg").selectAll('*').remove()
	var mistakesList = document.getElementById('commonMistakes')
	while (mistakesList.firstChild) {
		mistakesList.removeChild(mistakesList.firstChild)
	}
	var statsMode = document.getElementsByClassName('active statistics')[0].id
	var gameMode = document.getElementById('gameMode').innerHTML.toLowerCase()
	statsMode = getStatsMode(statsMode)
	gameMode = getGameMode(gameMode)
	renderOverallSummary(statsMode, gameMode)
	renderLast10Summary(statsMode, gameMode)
}

async function renderLast10Summary(statsMode, gameMode) {

	var topScore = document.getElementById('past10topScore')
	var topUser = document.getElementById('past10topUser')
	var average = document.getElementById('past10average')
	var sd = document.getElementById('past10sd')
	var lowest = document.getElementById('past10lowest')
	var accuracy = document.getElementById('past10accuracy')
	var time = document.getElementById('past10time')
	var mistakesList = document.getElementById('commonMistakes')
	var title = document.getElementById('overall-title')

	var postData = {limit: 10, gameMode: gameMode, statsMode: statsMode}
	var response = await fetch(lastScoresURL, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData)
	})
	var scoreData = await response.json();
	if (scoreData && scoreData.status == 1) {
		scoreData = scoreData.resp
	} else {
		return;
	}
	if (scoreData.length === 0) {
		topScore.innerHTML = 'Top Score: ' + 0
		topUser.innerHTML = 'Top User: ' + 0
		average.innerHTML = 'Average Score: ' + 0
		sd.innerHTML = 'Standard Deviation: ' + 0
		lowest.innerHTML = 'Lowest Score: ' + 0
		accuracy.innerHTML = 'Average Accuracy: ' + 0 + '%'
		time.innerHTML = 'Average Time Taken: ' + 0
		return;
	}

	if (statsMode) {
		response = await fetch(sessionUrl, {
		method: 'GET',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
			},
		})
		let data = await response.json()
		if (data && data.status == 1) {
			title.innerHTML = data.username + `'s Statistics`
		}
	} else {
		title.innerHTML = 'Overall Statistics'
	}
	console.log(scoreData)
	var scores = scoreData.map((datum) => datum.score)
	var topScoreValue = Math.max(...scores);
	var topUserValue = scoreData.reduce((max, user) => max.score > user.score ? max : user).name
	var averageValue = Math.round(scores.reduce((sum, val) => sum + val) / scores.length, 2);
	var sdValue = computeStandardDeviation(scores, averageValue)
	var lowestValue = Math.min(...scoreData.map((datum) => datum.score));
	var accuracyValue = Math.round(scoreData.reduce((acc, b) => acc.push(b.score/b.num_problems) && acc, []).reduce((acc, b) => acc + b)*100/(scoreData.length));

	drawBarGraph(scoreData)
	times = []
	mistakes = {}
	var userId;
	var gameNumber;
	var statisticsData;
	for (var i = 0; i < scoreData.length; i++) {
		userId = scoreData[i].user_id
		gameNumber = scoreData[i].game_number
		postData = {userId: userId, gameNumber: gameNumber}
		response = await fetch(lastStatisticsURL, {
			method: 'POST',
			mode: 'cors',
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(postData)
		})
		statisticsData = await response.json()
		if (statisticsData && statisticsData.status == 1){
			statisticsData = statisticsData.resp
			for (var j = 0; j < statisticsData.length; j++) {
				stats = statisticsData[j]
				var splitProblem = stats.problem.split(' × ')
				splitProblem = splitProblem[1] + ' × ' + splitProblem[0]
				if (stats.solution !== stats.answer) {
					if (stats.problem in mistakes) {
						mistakes[stats.problem] += 1
					} else if (splitProblem in mistakes) {
						mistakes[splitProblem] += 1
					} else {
						mistakes[stats.problem] = 1
					}
				}
				times.push(stats.time)
			}
		} else {
			return;
		}
	}
	sorted_mistakes = []
	for (key in mistakes) {
		sorted_mistakes.push([key, mistakes[key]])
	}
	sorted_mistakes.sort(function(a, b) {
		return b[1] - a[1]
	})
	var averageTimeValue = Math.round((times.reduce((a, b) => a + b)/times.length) * 100)/100

	topScore.innerHTML = 'Top Score: ' + topScoreValue
	topUser.innerHTML = 'Top User: ' + topUserValue
	average.innerHTML = 'Average Score: ' + averageValue
	sd.innerHTML = 'Standard Deviation: ' + sdValue
	lowest.innerHTML = 'Lowest Score: ' + lowestValue
	accuracy.innerHTML = 'Average Accuracy: ' + accuracyValue + '%'
	time.innerHTML = 'Average Time Taken: ' + averageTimeValue


	var mistakeItem;
	for (i = 0; i < sorted_mistakes.length; i++) {
		if (i == 5) {
			break;
		}
		mistakeItem = document.createElement('li')
		mistakeItem.innerHTML = sorted_mistakes[i][0]
		mistakesList.appendChild(mistakeItem)
	}


}
async function renderOverallSummary(statsMode, gameMode) {

	var gamesPlayed = document.getElementById('overall-games-played')
	var answered = document.getElementById('overall-answered')
	var correct = document.getElementById('overall-correct')
	var topScore = document.getElementById('overall-topscore')
	var averageScore = document.getElementById('overall-averagescore')
	var averageAccuracy = document.getElementById('overall-averageaccuracy')

	const postData = {gameMode: gameMode, statsMode: statsMode}
	var response = await fetch(overallStatisticsURL, {
		method: 'POST',
		mode: 'cors',
		cache: 'no-cache',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(postData),
		}
	)
	var data = await response.json()
	if (data && data.status == 1) {
		data = data.resp
		gamesPlayed.innerHTML = data.played
		answered.innerHTML = data.answered
		correct.innerHTML = data.correct
		topScore.innerHTML = data.top_score
		averageScore.innerHTML = data.average_score
		averageAccuracy.innerHTML = data.average_accuracy + '%'
	} else {
		gamesPlayed.innerHTML = 0
		answered.innerHTML = 0
		correct.innerHTML = 0
		topScore.innerHTML = 0
		averageScore.innerHTML = 0
		averageAccuracy.innerHTML = 0 + '%'
	}

	
}

function drawBarGraph(data) {
	for (var i = 0; i < data.length; i ++) {
		data[i].gameNumber = i + 1
	}
	const maxNumProblems = Math.max(...data.map((datum) => datum.num_problems))
	
	const svg = d3.select('#bargraph')
				  .attr('preserveAspectRatio',  'xMinYMin meet')
				  .attr('viewBox', '0 0 800 600')
				  .classed('svg-content-responsive', true)
    const svgContainer = d3.select('#barGraphContainer');
    
    const margin = 120;
    const width = 1200 - 2 * margin;
    const height = 600 - 2 * margin;

    const chart = svg.append('g')
      .attr('transform', `translate(${margin}, ${margin})`);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(data.map((s) => s.gameNumber))
      .padding(0.4)
    
    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, maxNumProblems + 6]);

    const makeYLines = () => d3.axisLeft()
      .scale(yScale)

    chart.append('g')
      .attr('class', 'bar-xaxis')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .attr('class', 'bar-yaxis')
      .call(d3.axisLeft(yScale));

    chart.append('g')
      .attr('class', 'grid')
      .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
      )

    const barGroups = chart
      .selectAll()
      .data(data)
      .enter()
      .append('g')

    barGroups
      .append('rect')
      .attr('class', 'bar-numproblems')
      .attr('x', (g) => xScale(g.gameNumber))
      .attr('y', (g) => yScale(g.num_problems))
      .attr('height', (g) => height - yScale(g.num_problems))
      .attr('width', xScale.bandwidth())


    barGroups
      .append('rect')
      .attr('class', 'bar-score')
      .attr('x', (g) => xScale(g.gameNumber))
      .attr('y', (g) => yScale(g.score))
      .attr('height', (g) => height - yScale(g.score))
      .attr('width', xScale.bandwidth())
      .on('mouseenter', function (actual, i) {

        barGroups.append('text')
          .attr('class', 'accuracy')
          .attr('x', (a) => xScale(a.gameNumber) + xScale.bandwidth() / 2)
          .attr('y', (a) => yScale(a.num_problems) + 15)
          .attr('fill', 'white')
          .attr('text-anchor', 'middle')
          .text((a, idx) => {
            const accuracy = (a.score/a.num_problems).toFixed(2) * 100
            
            let text = `${accuracy}%`
            return text
          })

      })
      .on('mouseleave', function () {

        d3.select(this)
          .attr('x', (a) => xScale(a.gameNumber))
          .attr('width', xScale.bandwidth())

        chart.selectAll('.accuracy').remove()
      })


    barGroups 
      .append('text')
      .attr('class', 'bar-value')
      .attr('x', (a) => xScale(a.gameNumber) + xScale.bandwidth() / 2)
      .attr('y', (a) => yScale(a.num_problems) - 20)
      .attr('text-anchor', 'middle')
      .text((a) => `${a.game_mode}`)

    
    svg
      .append('text')
      .attr('class', 'bargraph-ylabel')
      .attr('x', -(height / 2) - margin)
      .attr('y', margin / 3)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Number of problems')

    svg.append('text')
      .attr('class', 'bargraph-xlabel')
      .attr('x', width / 2 + margin)
      .attr('y', height + margin * 1.5)
      .attr('text-anchor', 'middle')
      .text('Game Number')

    svg.append('text')
      .attr('class', 'bargraph-title')
      .attr('x', width / 2 + margin)
      .attr('y', 75)
      .attr('text-anchor', 'middle')
      .text('Scores for the last 10 games')

   d3.select("bargraph")
	 .append("div")
	 // Container class to make it responsive.
	 .classed("svg-container", true) 
	 .append("svg")
	 // Responsive SVG needs these 2 attributes and no width and height attr.
	 .attr("preserveAspectRatio", "xMinYMin meet")
	 .attr("viewBox", "0 0 600 400")
	 // Class to make it responsive.
	 .classed("svg-content-responsive", true)
	 // Fill with a rectangle for visualization.
	 .append("rect")
	 .classed("rect", true)
	 .attr("width", 1200 - 2 * margin)
	 .attr("height", 600 - 2 * margin);

}
renderStatistics()