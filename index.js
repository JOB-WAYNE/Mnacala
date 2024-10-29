let currentPlayer = 'top'; // Track the current player
let gameState = {
    player1: [4, 4, 4, 4, 4, 4], // Initial bead counts for player 1
    player2: [4, 4, 4, 4, 4, 4], // Initial bead counts for player 2
    mancala: { top: 0, bottom: 0 } // Initial counts for mancala pots
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
                <div class="pot mancala" id="mb">${gameState.mancala.bottom}</div> 
            </div>
            <div class="section midsection">
                <div class="midrow botmid">
                    ${generatePotHTML(gameState.player1, 'bottom')}
                </div>
                <div class="midrow topmid">
                    ${generatePotHTML(gameState.player2, 'top')}
                </div>
            </div>
            <div class="section endsection">
                <div class="pot mancala" id="mt">${gameState.mancala.top}</div>        
            </div>
        </div>`;
}

function generatePotHTML(beadCounts, player) {
    if (player === 'top') {
        beadCounts = beadCounts.slice().reverse(); // Reverse pots for top player for proper display
    }
    return beadCounts.map((count, index) => {
        let potHTML = '<div class = "bead-container">';
        for (let i = 0; i < count; i++) {
            const color = beadColors[Math.floor(Math.random() * beadColors.length)];
            potHTML += `<div class="bead" style="background-color: ${color};"></div>`;
        }
        potHTML+=`</div>`;
        // Correctly set the ID
        return `<div class="pot" id="p${player}${index}">${potHTML}</div>`;
    }).join('');
}

function handlePotClick(potId) {
    if (checkGameOver()) return;

    // Use a regular expression to extract player and index from the pot ID
    const match = potId.match(/p(top|bottom)(\d+)/);
    if (!match) {
        console.error("Invalid pot ID:", potId);
        return;
    }

    const potPlayer = match[1];  // Extracts 'top' or 'bottom' from the pot ID
    const index = parseInt(match[2]);

    // Check if the clicked pot belongs to the current player
    if (potPlayer !== currentPlayer) {
        // Display a message indicating it's not the correct player's turn
        updateGameMessage(`It's ${currentPlayer === 'top' ? 'Top' : 'Bottom'} player's turn!`);
        return;
    }

    // Get the current player's pots
    const currentPots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;

    // Check if the selected pot has beads
    if (currentPots[index] === 0) {
        updateGameMessage("Invalid move! Please select a pot with beads.");
        return;
    }

    // Visual feedback for the clicked pot
    const clickedPot = document.getElementById(potId);
    clickedPot.style.backgroundColor = "rgba(255, 255, 0, 0.5)"; // Highlight the pot

    // Delay to show feedback before processing the move
    setTimeout(() => {
        clickedPot.style.backgroundColor = ""; // Reset color
        updateGameState(currentPlayer, index); // Update game state
        if (checkGameOver()) {
            endGame();
        }
    }, 300);
}

function updateGameState(player, potIndex) {
    // Get the current player's pots and their opponent's pots
    const currentPots = player === 'top' ? gameState.player1 : gameState.player2;
    const opponentPots = player === 'top' ? gameState.player2 : gameState.player1;
    
    // Get the number of beads in the selected pot
    const beadsToMove = currentPots[potIndex];
    currentPots[potIndex] = 0; // Clear the selected pot

    // Distribute the beads and get the index of the last pot
    const lastIndex = distributeBeads(player, potIndex, beadsToMove);

    // Update the board to reflect the new state
    updateBoard();

    // **Capture Rule:**
// **Capture Rule:**
if (isOnPlayerSide(player, lastIndex) && currentPots[lastIndex] === 1) {
    let oppositeIndex;
    if (player === 'top') {
        oppositeIndex = 5 - (lastIndex - 7); // Adjust for the top player's reversed row
    } else {
        oppositeIndex = 5 - lastIndex; // For bottom player, it's straightforward
    }
    
    const capturedBeads = opponentPots[oppositeIndex];

    if (capturedBeads > 0) {
        // Clear the last pot and the opposite pot
        currentPots[lastIndex] = 0;
        opponentPots[oppositeIndex] = 0;

        // Add the captured beads to the player's Mancala
        if (player === 'top') {
            gameState.mancala.top += capturedBeads + 1; // Include the last bead
        } else {
            gameState.mancala.bottom += capturedBeads + 1; // Include the last bead
        }

        updateGameMessage(`${player === 'top' ? 'Top' : 'Bottom'} captured ${capturedBeads} beads!`);
    }
}
    // If the last bead landed in the player's Mancala, they get another turn
    if ((player === 'top' && lastIndex === 6) || (player === 'bottom' && lastIndex === 13)) {
        updateGameMessage(`${player === 'top' ? 'Top' : 'Bottom'}'s turn again!`);
        return; // No need to switch players, they get another turn
    }
    // Switch to the other player if the last bead did not land in the Mancala
    switchPlayer();
}

function isOnPlayerSide(player, index) {
    // For top player: valid indices are 7-12 (their row)
    // For bottom player: valid indices are 0-5 (their row)
    return (player === 'top' && index >= 7 && index <= 12) ||
           (player === 'bottom' && index >= 0 && index <= 5);
}
function distributeBeads(player, startIndex, beadCount) {
    let index = startIndex;
    const isTopPlayer = player === 'top';

    while (beadCount > 0) {
        index++;

        // Wrap around if index exceeds 13
        if (index > 13) index = 0;

        // Top player shouldn't place a bead in the bottom player's Mancala
        if (isTopPlayer && index === 6) continue;

        // Bottom player shouldn't place a bead in the top player's Mancala
        if (!isTopPlayer && index === 13) continue;

        // Place a bead in the current position
        if (index === 6) {
            gameState.mancala.bottom++;
        } else if (index === 13) {
            gameState.mancala.top++;
        } else if (index >= 0 && index <= 5) {
            gameState.player1[index]++;
        } else if (index >= 7 && index <= 12) {
            gameState.player2[index - 7]++;
        }

        beadCount--;
    }

    return index; // Return the last index
}
function updateBoard() {
    document.getElementById('gameBoard').innerHTML = generateBoardHTML();
    addPotHandlers(); // Re-attach handlers after updating the board

    if (checkGameOver()) {
        endGame();
        return; 
    }
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'top' ? 'bottom' : 'top';
    updateGameMessage(`Player ${currentPlayer === 'top' ? 'Top' : 'Bottom'}'s turn!`);
    if (!hasValidMoves()) {
        endGame(); // Handle game end logic if no valid moves exist
    }
}


function endGame() {
    const winner = gameState.mancala.top > gameState.mancala.bottom ? 'Top' : (gameState.mancala.bottom > gameState.mancala.top ? 'Bottom' : 'Tie');
    updateGameMessage(`Game Over! Player ${winner} wins!`);
}

function checkGameOver() {
    const player1Empty = gameState.player1.every(count => count === 0);
    const player2Empty = gameState.player2.every(count => count === 0);

    if (player1Empty || player2Empty) {
        // Move all remaining beads to the opponent's Mancala
        if (player1Empty) {
            gameState.mancala.top += gameState.player2.reduce((a, b) => a + b, 0);
            gameState.player2.fill(0); // Clear player 2's pots
        } else if (player2Empty) {
            gameState.mancala.bottom += gameState.player1.reduce((a, b) => a + b, 0);
            gameState.player1.fill(0); // Clear player 1's pots
        }
        return true;
    }
    return false;
}

function hasValidMoves() {
    const pots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;
    const validMovesExist = pots.some(count => count > 0);
    
    if (!validMovesExist) {
        updateGameMessage(`No valid moves available for ${currentPlayer}. Game Over!`);
        endGame(); // Call your function to handle game end logic
    }
    
    return validMovesExist;
}

document.getElementById('restart').addEventListener('click', function() {
    // Reset game state
    gameState = {
        player1: [4, 4, 4, 4, 4, 4],
        player2: [4, 4, 4, 4, 4, 4],
        mancala: { top: 0, bottom: 0 }
    };
    currentPlayer = 'top'; // Reset to player 1
    updateGameMessage("Player Top's turn!");
    updateBoard();
    addPotHandlers();
});

function addPotHandlers() {
    const pots = document.querySelectorAll('.pot');
    pots.forEach(pot => {

        pot.addEventListener('click', () => {
            handlePotClick(pot.id);
        });
    });
}

$(document).ready(function() {
    updateBoard();
    addPotHandlers();
    updateGameMessage("Player Top's turn!");
});
