let currentPlayer = 'playerOne'; // Track the current player
let gameState = {
    playerOne: [4, 4, 4, 4, 4, 4], // Initial bead counts for Player One
    playerTwo: [4, 4, 4, 4, 4, 4], // Initial bead counts for Player Two
    mancala: { playerOne: 0, playerTwo: 0 } // Initial counts for mancala pots
};

// Array of colors for the beads
const beadColors = [
    '#FF5733', // Red
    '#33FF57', // Green
    '#3357FF', // Blue
    '#F1C40F', // Yellow
    '#8E44AD', // Purple
    '#E67E22'  // Orange
];

function updateGameMessage(message) {
    document.getElementById('gameMessage').innerText = message;
}

function generateBoardHTML() {
    return `
        <div class="board">
            <div class="section endsection">
                <div class="pot mancala" id="mPlayerOne">${gameState.mancala.playerOne}</div> 
            </div>
            <div class="section midsection">
                <div class="midrow botmid">
                    ${generatePotHTML(gameState.playerOne, 'playerOne')}
                </div>
                <div class="midrow topmid">
                    ${generatePotHTML(gameState.playerTwo, 'playerTwo')}
                </div>
            </div>
            <div class="section endsection">
                <div class="pot mancala" id="mPlayerTwo">${gameState.mancala.playerTwo}</div>        
            </div>
        </div>`;
}

function generatePotHTML(beadCounts, player) {
    if (player === 'playerOne') {
        beadCounts = beadCounts.slice().reverse(); 
    }
    return beadCounts.map((count, index) => {
        const beadHTML = Array.from({ length: count }).map(() => {
            const color = beadColors[Math.floor(Math.random() * beadColors.length)];
            return `<div class="bead" style="background-color:${color}"></div>`;
        }).join('');

        return `
            <div class="pot" id="p${player}${index}">
                <div class="bead-container">
                    ${beadHTML}
                </div>
            </div>
        `;
    }).join('');
}

// Perform an automated move
function automatedMove(player) {
    const currentPots = player === 'playerOne' ? gameState.playerOne : gameState.playerTwo;
    const possibleMoves = [];

    // Simple strategy: Choose the first non-empty pot
    for (let i = 0; i < currentPots.length; i++) {
        if (currentPots[i] > 0) {
            possibleMoves.push(i);
        }
    }

    if (possibleMoves.length > 0) {
        const potIndex = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        const potId = `p${player}${player === 'playerOne' ? 5 - potIndex : potIndex}`; // Adjust index for playerOne

        updateGameState(player, potIndex); // Directly update the game state without requiring a click
        return true; // Move made successfully
    } else {
        return false; // No valid moves for this player
    }
}

// Autoplay the game with a slower interval
function autoPlayGame() {
    let intervalId;

    intervalId = setInterval(() => {
        if (checkGameOver()) {
            clearInterval(intervalId);
            endGame();
            return;
        }

        // Make an automated move for the current player
        if (!automatedMove(currentPlayer)) {
            switchPlayer();
            if (checkGameOver()) { // Still no valid moves, game over
                clearInterval(intervalId);
                endGame();
                return;
            }
        }

    }, 1500); // Slower autoplay speed (1.5 seconds)
    
    return intervalId;
}

function updateGameState(player, potIndex) {
    const currentPots = player === 'playerOne' ? gameState.playerOne : gameState.playerTwo;
    const opponentPots = player === 'playerOne' ? gameState.playerTwo : gameState.playerOne;

    const beadsToMove = currentPots[potIndex];
    currentPots[potIndex] = 0; // Clear the selected pot

    const lastIndex = distributeBeads(player, potIndex, beadsToMove);
    updateBoard();

    // Check for capture
    if (isOnPlayerSide(player, lastIndex) && currentPots[lastIndex] === 1) {
        const oppositeIndex = 5 - (lastIndex - 7);
        const capturedBeads = opponentPots[oppositeIndex];

        if (capturedBeads > 0) {
            currentPots[lastIndex] = 0; // Clear the last pot
            opponentPots[oppositeIndex] = 0; // Clear the opposite pot

            if (player === 'playerOne') {
                gameState.mancala.playerOne += capturedBeads + 1; // Include the captured beads and the last bead
            } else {
                gameState.mancala.playerTwo += capturedBeads + 1; // Include the captured beads and the last bead
            }

            updateGameMessage(`${player === 'playerOne' ? 'Player One' : 'Player Two'} captured ${capturedBeads} beads!`);
        }
    }

    // Check if the last bead landed in the player's Mancala
    if ((player === 'playerOne' && lastIndex === 13) || (player === 'playerTwo' && lastIndex === 6)) {
        updateGameMessage(`${player === 'playerOne' ? 'Player One' : 'Player Two'}'s turn again!`);
    } else {
        switchPlayer();
    }
}

function isOnPlayerSide(player, index) {
    return (player === 'playerOne' && index >= 7 && index <= 12) ||
           (player === 'playerTwo' && index >= 0 && index <= 5);
}

function distributeBeads(player, startIndex, beadCount) {
    let index = startIndex;

    while (beadCount > 0) {
        index++;
        if (index > 13) index = 0; // Reset index if it goes beyond the board

        // Skip the opponent's Mancala
        if ((player === 'playerOne' && index === 6) || (player === 'playerTwo' && index === 13)) {
            continue;
        }

        // Place beads in the respective pots
        if (index === 6) {
            gameState.mancala.playerTwo++; // Add to Player Two's Mancala
        } else if (index === 13) {
            gameState.mancala.playerOne++; // Add to Player One's Mancala
        } else if (index >= 0 && index <= 5) {
            gameState.playerTwo[index]++; // Player Two's pots
        } else if (index >= 7 && index <= 12) {
            const adjustedIndex = index - 7; // Correctly adjust index for Player One
            gameState.playerOne[adjustedIndex]++;
        }

        beadCount--;
    }

    return index; // Return the last index
}

function updateBoard() {
    document.getElementById('gameBoard').innerHTML = generateBoardHTML();
    if (checkGameOver()) {
        endGame();
        return; 
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'playerOne' ? 'playerTwo' : 'playerOne';
    updateGameMessage(`It's ${currentPlayer === 'playerOne' ? 'Player One' : 'Player Two'}'s turn!`);
    if (!hasValidMoves()) {
        endGame();
    }
}

function endGame() {
    const winner = gameState.mancala.playerOne > gameState.mancala.playerTwo ? 'Player One' : (gameState.mancala.playerTwo > gameState.mancala.playerOne ? 'Player Two' : 'Tie');
    updateGameMessage(`Game Over! ${winner} wins!`);
}

function checkGameOver() {
    const playerOneEmpty = gameState.playerOne.every(count => count === 0);
    const playerTwoEmpty = gameState.playerTwo.every(count => count === 0);

    if (playerOneEmpty || playerTwoEmpty) {
        if (playerOneEmpty) {
            gameState.mancala.playerOne += gameState.playerTwo.reduce((a, b) => a + b, 0); // Move remaining beads to Player One's Mancala
            gameState.playerTwo.fill(0);
        } else if (playerTwoEmpty) {
            gameState.mancala.playerTwo += gameState.playerOne.reduce((a, b) => a + b, 0); // Move remaining beads to Player Two's Mancala
            gameState.playerOne.fill(0);
        }
        return true;
    }
    return false;
}

function hasValidMoves() {
    const pots = currentPlayer === 'playerOne' ? gameState.playerOne : gameState.playerTwo;
    const validMovesExist = pots.some(count => count > 0);

    if (!validMovesExist) {
        updateGameMessage(`No valid moves available for ${currentPlayer}. Game Over!`);
        endGame();
    }

    return validMovesExist;
}

document.addEventListener('DOMContentLoaded', function() {
    updateBoard();
    updateGameMessage("Player One's turn!");

    // Start the autoplay as soon as the board is ready
    autoPlayGame();
});