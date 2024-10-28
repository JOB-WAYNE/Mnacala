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
                <div class="pot" id="mb">${gameState.mancala.bottom}</div> 
            </div>
            <div class="section midsection">
                <div class="midrow botmid">
                    ${generatePotHTML(gameState.player1,'bottom')}
                </div>
                <div class="midrow topmid">
                    ${generatePotHTML(gameState.player2, 'top')}
                </div>
            </div>
            <div class="section endsection">
                <div class="pot" id="mt">${gameState.mancala.top}</div>        
            </div>
        </div>
    `;
}

function generatePotHTML(beadCounts) {
    return beadCounts.map((count, index) => {
        let potHTML = '';
        for (let i = 0; i < count; i++) {
            const color = beadColors[Math.floor(Math.random() * beadColors.length)];
            potHTML += `<div class="bead" style="background-color: ${color};"></div>`;
        }
        // Add the class 'pot' here
        return `<div class="pot" id="p${index}">${potHTML}</div>`;
    }).join('');
}


function handlePotClick(potId) {
    const potIndex = parseInt(potId.replace('p', ''));
    const currentPots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;

    if (currentPots[potIndex] === 0) {
        updateGameMessage("Invalid move! Please select a valid pot.");
        return;
    }

    // Visual feedback for the clicked pot
    const clickedPot = document.getElementById(potId);
    clickedPot.style.backgroundColor = "rgba(255, 255, 0, 0.5)"; // Highlight the pot

    // Delay to show feedback before processing the move
    setTimeout(() => {
        clickedPot.style.backgroundColor = ""; // Reset color
        updateGameState(potIndex); // Update game state
    }, 300);
}

function updateGameState(potIndex) {
    const currentPots = currentPlayer === 'top' ? gameState.player2 : gameState.player1;
    const beadsToMove = currentPots[potIndex];

    currentPots[potIndex] = 0;
    const lastIndex = distributeBeads(potIndex, beadsToMove);

    updateBoard();

    // If the last bead landed in the player's Mancala, they get another turn
    if ((currentPlayer === 'top' && lastIndex === 6) || (currentPlayer === 'bottom' && lastIndex === 13)) {
        updateGameMessage(`Player ${currentPlayer}'s turn again!`);
    } else {
        switchPlayer();
    }
}

function distributeBeads(startIndex, beadCount) {
    let index = startIndex;
    const isTopPlayer = currentPlayer === 'top';
    const currentPots = isTopPlayer ? gameState.player2 : gameState.player1;
    const opponentPots = isTopPlayer ? gameState.player1 : gameState.player2;

    while (beadCount > 0) {
        index = (index + 1) % 14;

        // Skip opponent's mancala
        if ((isTopPlayer && index === 6) || (!isTopPlayer && index === 13)) {
            continue;
        }

        // Player's own mancala
        if (index === 13 && !isTopPlayer) {
            gameState.mancala.bottom++;
        } else if (index === 6 && isTopPlayer) {
            gameState.mancala.top++;
        } 
        // Distribute to player's pots
        else if (index < 6 && isTopPlayer) {
            gameState.player2[index]++;
        } else if (index > 6 && !isTopPlayer) {
            gameState.player1[index - 7]++;
        } 
        // Distribute to opponent's pots
        else if (index < 6 && !isTopPlayer) {
            gameState.player1[index]++;
        } else if (index > 6 && isTopPlayer) {
            gameState.player2[index - 7]++;
        }

        beadCount--;
    }
}
function updateBoard() {
    document.getElementById('gameBoard').innerHTML = generateBoardHTML();
    addPotHandlers(); // Re-attach handlers after updating the board

    if (checkGameOver()) {
        endGame();
        return 'addPotHandlers';
    }}
function switchPlayer() {
    currentPlayer = currentPlayer === 'top' ? 'bottom' : 'top';
    updateGameMessage(`Player ${currentPlayer === 'top' ? 'Top' : 'Bottom'}'s turn!`);
}

function endGame() {
    const winner = gameState.mancala.top > gameState.mancala.bottom ? 'Top' : 'Bottom';
    updateGameMessage(`Game Over! Player ${winner} wins!`);
}
function checkGameOver() {
    const player1Empty = gameState.player1.every(count => count === 0);
    const player2Empty = gameState.player2.every(count => count === 0);

    if (player1Empty || player2Empty) {
        // Move all remaining beads to the opponent's Mancala
        if (player1Empty) {
            gameState.mancala.bottom += gameState.player2.reduce((a, b) => a + b, 0);
            gameState.player2.fill(0);
        } else if (player2Empty) {
            gameState.mancala.top += gameState.player1.reduce((a, b) => a + b, 0);
            gameState.player1.fill(0);
        }
        return true;
    }
    return false;
}

function hasValidMoves() {
    const pots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;
    return pots.some(count => count > 0);
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
});

function addPotHandlers() {
    $(".topmid .pot, .botmid .pot")
        .mouseenter(function() {
            $(this).css({
                "background-color": "rgba( 255, 255, 255, 0.16)",
                "cursor": "pointer"
            });
        }).mouseleave(function() {
            $(this).css({
                "background-color": "rgba(255, 255, 255, 0.08)",
                "cursor": "arrow"
            });
        }).click(function() {
            handlePotClick($(this).attr("id"));
        });
}

$(document).ready(function() {
    updateBoard();
    addPotHandlers();
    updateGameMessage("Player Top's turn!");
});
