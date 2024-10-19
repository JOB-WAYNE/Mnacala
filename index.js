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
                    ${generatePotHTML(gameState.player1)}
                </div>
                <div class="midrow topmid">
                    ${generatePotHTML(gameState.player2)}
                </div>
            </div>
            <div class="section endsection">
                <div class="pot" id="mt">${gameState.mancala.top}</div>        
            </div>
        </div>
    `;
}

function generatePotHTML(beadCounts) {
    return beadCounts.map(count => {
        let potHTML = '';
        for (let i = 0; i < count; i++) {
            // Assign a random color from the beadColors array
            const color = beadColors[Math.floor(Math.random() * beadColors.length)];
            potHTML += `<div class="bead" style="background-color: ${color};"></div>`;
        }
        return `<div class="pot">${potHTML}</div>`;
    }).join('');
}

function insertBoardIntoParagraphs() {
    const paragraphs = document.querySelectorAll('.myParagraph');
    paragraphs.forEach(paragraph => {
        paragraph.innerHTML += generateBoardHTML();
    });
}
function handlePotClick(potId) {
    const pot = new Pot(potId);
    if (!pot.isValidMove(currentPlayer)) {
        updateGameMessage("Invalid move! Please select a valid pot.");
        return;
    }

    // Visual feedback for the clicked pot
    const clickedPot = document.getElementById(potId);
    clickedPot.style.backgroundColor = "rgba(255, 255, 0, 0.5)"; // Highlight the pot

    // Delay to show feedback before processing the move
    setTimeout(() => {
        clickedPot.style.backgroundColor = ""; // Reset color
        updateGameState(potId.replace('p', '')); // Update game state
    }, 300);
}
function moveBead(bead, pot) {
    $(bead).animate({
        top: pot.$().offset().top,
        left: pot.$().offset().left
    }, 500, function() {
        $(this).appendTo(pot.$()).css({top: 'initial', left: 'initial'});
    });
}
function stringOut(srcPot, lastPot) {
    const children = srcPot.$().children();
    if (children.length === 0) {
        handleEmptyPot(srcPot);
        return;
    }
    if (lastPot === undefined) {
        lastPot = srcPot;
    }
    const el = children.get(0);
    lastPot = lastPot.getNextSown(currentPlayer === 'top');

    if (isStealMove(children.length, lastPot)) {
        handleStealMove(el, lastPot);
    } else {
        moveBead(el, lastPot);
    }

    if (checkGameOver()) {
        endGame();
        return;
    }

    switchPlayer();
    setTimeout(() => stringOut(srcPot, lastPot), 250);
}

function handleEmptyPot(srcPot) {
    srcPot.$().css("background-color", "rgba(255, 255, 255, 0.08)");
    addPotHandlers();
}

function isStealMove(childrenLength, lastPot) {
    return childrenLength === 1 &&
           currentPlayer === lastPot.isTop() &&
           lastPot.$().children().length === 0 &&
           !lastPot.isMan();
}

function handleStealMove(el, lastPot) {
    lastPot.getOpposite().$().children().each(function(idx, elSteal) {
        moveBead(elSteal, new Pot('mt'));
    });
    moveBead(el, new Pot('mt'));
}

function switchPlayer() {
    currentPlayer = currentPlayer === 'top' ? 'bottom' : 'top';
    updateGameMessage("Player " + (currentPlayer === 'top' ? "Top" : "Bottom") + "'s turn!");
}

function endGame() {
    updateGameMessage("Game Over! " + (currentPlayer === 'top' ? "Player 1" : "Player 2") + " wins!");
}
function checkGameOver() {
    const player1Empty = gameState.player1.every(count => count === 0);
    const player2Empty = gameState.player2.every(count => count === 0);
    
    if (player1Empty || player2Empty) {
        // Check if the other player has valid moves
        if (!hasValidMoves()) {
            return true;
        }
    }
    return false;
}

function hasValidMoves() {
    // Check if the current player has any valid moves left
    const pots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;
    return pots .some(count => count > 0);
}
function updateGameState(potIndex) {
    // Logic to update the game state based on the selected pot
    const currentPots = currentPlayer === 'top' ? gameState.player1 : gameState.player2;
    const beadsToMove = currentPots[potIndex];

    // Clear the selected pot
    currentPots[potIndex] = 0;

    // Distribute beads to the pots
    distributeBeads(potIndex, beadsToMove);
    updateBoard();
}

function distributeBeads(startIndex, beadCount) {
    let index = startIndex;
    while (beadCount > 0) {
        index = (index + 1) % 12; // Loop through pots
        if (index < 6) {
            gameState.player1[index]++;
        } else {
            gameState.player2[index - 6]++;
        }
        beadCount--;
    }
}

function updateBoard() {
    document.getElementById('gameBoard').innerHTML = generateBoardHTML();
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
    insertBoardIntoParagraphs(); // Re-insert the board
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
            // Check if move is valid
            $(".topmid .pot, .botmid .pot").off();
            handlePotClick($(this).attr("id"));
        });
}

$(document).ready(function() {
    insertBoardIntoParagraphs();
    addPotHandlers();
    updateGameMessage("Player Top's turn!");
});

