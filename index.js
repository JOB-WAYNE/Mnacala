// index.js

let currentPlayer = 'top'; // Track the current player
let gameState = {
    player1: [ 4, 4, 4, 4, 4, 4 ],
    player2: [ 4, 4, 4, 4, 4, 4 ],
    mancala: { top: 0, bottom: 0 }
};

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
            potHTML += `<div class="bead"></div>`;
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
    if (pot.isTop() && currentPlayer === 'top') {
        string_out(pot);
    } else if (pot.isBottom() && currentPlayer === 'bottom') {
        string_out(pot);
    } else {
        updateGameMessage("It's not your turn!");
    }
}

function string_out(src_pot, last_pot) {
    const children = src_pot.$().children();
    if (children.length === 0) {
        src_pot.$().css("background-color", "rgba(255, 255, 255, 0.08)");
        addPotHandlers();
        return;
    }
    if (last_pot === undefined) {
        last_pot = src_pot;
    }
    const el = children.get(0);
    last_pot = last_pot.getNextSown(currentPlayer === 'top');
    
    // Steal logic
    if (children.length === 1 &&
        currentPlayer === last_pot.isTop() &&
        last_pot.$().children().length === 0 &&
        !last_pot.isMan()) {
        last_pot.getOpposite().$().children().each(function(idx, el_steal) {
            move_bead(el_steal, new Pot('mt'));
        });
        move_bead(el, new Pot('mt'));
    } else {
        move_bead(el, last_pot);
    }
    setTimeout(string_out, 250, src_pot, last_pot);
}

function addPotHandlers() {
    $(".topmid .pot, .botmid .pot")
        .mouseenter(function() {
            $(this).css({
                "background-color": "rgba(255, 255, 255, 0.16)",
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