
function createGame(gameCells, reset) {
	var game = {};

	game.opponentMove = function (e) {
		cell = e.srcElement;
		if (cell.innerHTML == "") {  
			cell.innerHTML = "X";
			game.checkForWinner("X");
			game.myMove();
		}
	}

	game.myMove = function() {
		emptyCells = []
		for (var x = 0; x < gameCells.length; x++) {
			if (gameCells[x].innerHTML == "") {
				emptyCells.push(x);
			}
		}
		var emptyCellIdx = Math.floor(Math.random() * emptyCells.length) + 1;
		var nextMove = emptyCells[emptyCellIdx] 
		if (gameCells[nextMove] !== undefined) {
			gameCells[nextMove].innerHTML = "O";
			game.checkForWinner("O");
		}
	}

	game.checkForWinner = function(playerSymbol) {
		winPatterns = [
			[0,1,2], [3,4,5], [6,7,8], 
			[0,3,6], [1,4,7], [2,5,8],
			[0,4,8], [6,4,2]  
			];
		for (var x = 0; x < winPatterns.length; x++) {				
			matchCount = 0;
			for (var j = 0; j < winPatterns[x].length; j++) {
				if(gameCells[winPatterns[x][j]].innerHTML == playerSymbol) {
					matchCount++;
				}
			}
			if (matchCount == 3) {
				alert(playerSymbol + " wins!");
				break;
			}
		}
	}

	game.reset = function() {
		for (var x = 0; x < gameCells.length; x++) {
			gameCells[x].innerHTML = "";
		}
	}

	for (var x = 0; x < gameCells.length; x++) {
		gameCells[x].id = x;
		gameCells[x].onclick = game.opponentMove;
	}

	reset.onclick = game.reset;
}

window.onload = function() {
	createGame(document.getElementsByClassName("cell"), document.getElementById("reset"));	
}