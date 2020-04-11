let colors = 6; 
let holes = 4; 
let rows = 6;

let thePattern = ['red', 'green', 'orange', 'mauve'];
let currentPosition = { x: 0, y: 0 }
let gameOver = false;

$(function() {
    start('classical');
});

function start(gameType) {
    initValues(gameType);
    generateSidePanel();
    generateShieldRow();
    generateDecodingArea();
    setHolesBackgroundColor(0);
}

function initValues(gameType) {
    if (gameType === 'classical') {
        colors = 6;
        holes = 4;
        rows = 6;
    } else if (gameType === 'super') {
        colors = 8;
        holes = 5;
        rows = 10;
    }
    thePattern = generateRandomPattern(gameType);
    currentPosition = { x: 0, y: 0 }
    gameOver = false;
}

function generateSidePanel() {
    $("#sidePanel").empty();
    $("#sidePanel").append(generateSidePanelHtml());
}

function generateShieldRow() {
    $("#shieldRow").empty();
    $("#shieldRow").append(generateShieldRowHtml());
}

function generateDecodingArea() {
    $("#decodingArea").empty();
    $("#decodingArea").append(generateDecodingAreaHtml());
}

function setHolesBackgroundColor(activeRow) {
    for (let r = 0; r < rows; r++) {
        for (let h = 0; h < holes; h++) {
            const $hole = $(`#hole${r}${h}`);
            if (r === activeRow) {
                $hole.removeClass("inactive-hole");
                $hole.addClass("active-hole");
            } else {
                $hole.removeClass("active-hole");
                $hole.addClass("inactive-hole");
            }
        }
    }
}

function generateRandomPattern(gameType) {
    const availableColors = gameType === 'classical' ?
        shuffle(['red', 'yellow', 'blue', 'green', 'mauve', 'orange']) :
        shuffle(['red', 'yellow', 'blue', 'green', 'mauve', 'orange', 'brown', 'teal']);
    return availableColors.slice(0, holes);
}

function shuffle(anArray) {
    const itemCount = anArray.length;
    // Swap many times pairs of items picked at random
    for (let i = 0; i < 100; i++) {
        const index1 = Math.floor(Math.random() * itemCount);
        const index2 = Math.floor(Math.random() * itemCount);
        const tmp = anArray[index1];
        anArray[index1] = anArray[index2];
        anArray[index2] = tmp;
    }
    return anArray;
}

function generateSidePanelHtml() {
    let result = 
        '<div class="d-flex flex-row"><div class="mx-auto">' + pegSvgHtml('red') + pegSvgHtml('yellow') + '</div></div>' +
        '<div class="d-flex flex-row"><div class="mx-auto">' + pegSvgHtml('blue') + pegSvgHtml('green') + '</div></div>' +                  
        '<div class="d-flex flex-row"><div class="mx-auto">' + pegSvgHtml('mauve') + pegSvgHtml('orange') + '</div></div>';
    if (colors === 8) {
        result += '<div class="d-flex flex-row"><div class="mx-auto">' + pegSvgHtml('brown') + pegSvgHtml('teal') + '</div></div>';
    }
    result += 
        '<div class="d-flex flex-row"><div class="pt-5 mx-auto">' + 
        '<button type="button" class="btn btn-primary" onclick="confirmStart(\'classical\');">Start classical</button>' + 
        '</div></div>';        
	result +=
        '<div class="d-flex flex-row"><div class="pt-5 mx-auto">' + 
        '<button type="button" class="btn btn-primary" onclick="confirmStart(\'super\');">Start super</button>' + 
        '</div></div>';        
    result += 
        '<div class="d-flex flex-row"><div class="pt-5 mx-auto">' + 
        '<button type="button" class="btn btn-info" data-toggle="modal" data-target="#helpModal">Game rules</button>' + 
        '</div></div>';
    return result; 
}

function confirmStart(gameType) {
    if (confirm('Start a new game?')) { 
        start(gameType); 
    }
}

function generateShieldRowHtml(revealSolution = false) {
    let shieldRowHtml = '<div class="row">';
    shieldRowHtml += '<div class="col-sm-12"><div class="d-flex flex-row align-items-center">';
    shieldRowHtml += '<svg height="80" width="40"></svg>'; // empty space, corresponding to the row index text in the play area
    for (let h = 0; h < holes; h++) {
        if (revealSolution) {
            shieldRowHtml += pegSvgHtml(thePattern[h], '', false);
        } else {
            shieldRowHtml += pegSvgHtml('grey', '?', false);
        }
    }
    shieldRowHtml += '</div></div></div>';
    return shieldRowHtml;
}

function generateDecodingAreaHtml() {
    let decodingRowsHtml = '';
    for (let r = 0; r < rows; r++) {
        let rowHtml = '<div class="row">';

        //
        // The holes area
        //
        rowHtml += `<div class="col-sm-12"><div class="d-flex flex-row align-items-center">`;
        
        // A text displaying the row index
        rowHtml += 
            '<svg height="80" width="40">' + 
            `<text x="0" y="50" fill="lightgrey" style="font: 30px sans-serif;">${r+1}</text>` + 
            '</svg>';
        
        // The actual holes
        for (let h = 0; h < holes; h++) {
            rowHtml += holeHtml(r, h); 
        }

        //            
        // The Undo and Confirm buttons
        //
        rowHtml += '<div>' + 
            `<button id="undoBtn${r}" type="button" class="m-2 undo-button btn btn-danger" onclick="undoClicked();" style="display:none;">&#10007;</button>` + 
            `<button id="okBtn${r}" type="button" class="m-2 confirm-button btn btn-success" onclick="confirmClicked();" style="display:none;">&#10003;</button>`; 
        rowHtml += '</div>';

        //
        // The answer area
        //
        rowHtml += `<div><span id="answer${r}"></span></div>`;

        rowHtml += '</div></div></div>';
        decodingRowsHtml += rowHtml;
    }
    return decodingRowsHtml;
}

function pegSvgHtml(colorName, text, clickable = true, position = null) {
    return '<svg height="80" width="80">' + 
        `<circle cx="40" cy="40" r="30" stroke-width="0" fill="url(#${colorName}Gradient)" data-color="${colorName}" ` +
        (clickable ? 'onclick="onPegClicked.call(this);" ' : ' ') +  
        (position !== null ? `data-x="${position.x}" data-y="${position.y}" ` : ' ') + '/>' +
        (typeof(text) !== 'undefined' ? `<text x="32" y="50" fill="black" style="font: 30px sans-serif;">${text}</text>` : '') +
        '</svg>';
}

function holeHtml(row, hole) {
    return `<span id="hole${row}${hole}" class="hole">${holeSvgHtml()}</span>`; 
}

function holeSvgHtml() {       
    return '<svg height="80" width="80">' + 
        '<circle cx="40" cy="40" r="30" stroke="black" stroke-width="1" fill="white" />' +
        '</svg>';
}

function blackAnswerSvgHtml() {       
    return '<svg height="80" width="80">' + 
        '<polygon points="10,40 40,70 70,40 40,10" style="fill:black;stroke:gray;stroke-width:1" />' + 
        '</svg>';
}

function whiteAnswerSvgHtml() {       
    return '<svg height="80" width="80">' + 
        '<polygon points="10,40 40,70 70,40 40,10" style="fill:white;stroke:gray;stroke-width:1" />' + 
        '</svg>';
}

function enableUndo($undoButton) {
    $undoButton.show();
}

function enableConfirm($confirmButton) {
    $confirmButton.show();
}

function disableUndo($undoButton) {
    $undoButton.hide();
}

function disableConfirm($confirmButton) {
    $confirmButton.hide();
}

function putPeg(pegColor, position) {
    // Replace the hole SVG with a peg SVG
    const $hole = $(`#hole${position.y}${position.x}`);
    $hole.empty();
    $hole.append(pegSvgHtml(pegColor, undefined, true, position));

    // Then update the status of the undo and confirm buttons:
    // 1. Enable the undo button
    enableUndo($(`#undoBtn${position.y}`));
    // 2. Enable the confirm button, but only if the peg was put into the last hole of the row
    if (position.x >= holes - 1) {
        enableConfirm($(`#okBtn${position.y}`));
    }
}

function removePeg(position) {
    // Replace the peg SVG code with the hole SVG
    const $hole = $(`#hole${position.y}${position.x}`);
    $hole.empty();
    $hole.append(holeSvgHtml());

    // Then update the status of the undo and confirm buttons:
    // 1. Disable the undo button if we are the beginning of the row as there's nothing to undo anymore
    if (position.x <= 0) {
        disableUndo($(`#undoBtn${position.y}`));
    }
    // 2. Disable the confirm button because the row is incomplete
    disableConfirm($(`#okBtn${position.y}`));
}

function onPegClicked() {
    if (gameOver) {
        return;
    }
    
    const $peg = $(this);
    const pegX = $peg.data('x');
    const pegY = $peg.data('y');
    if (typeof(pegX) !== 'undefined' && typeof(pegY) !== 'undefined') {
        // The clicked peg is in a hole in the decoding area. 
		// If it's the last peg added, undo it. 
		const previousPosition = calculatePreviousPosition();
		if (pegX === previousPosition.x && pegY === previousPosition.y) {
			undoLastMove();
		}
    } else {
		// The clicked peg is in the side panel. Put it in the next available hole.
		const pegColor = $peg.data('color');
		putPeg(pegColor, currentPosition);

		// If there are holes available, advance the current position
		const nextPosition = calculateNextPosition();
		if (nextPosition !== null) {
			currentPosition = nextPosition;
		}
	}
}

function calculateNextPosition() {
    if (currentPosition.x < holes) {
        // Next hole on the same row (allowing one position beyond the last index!)
        return { 
            x: currentPosition.x + 1, 
            y: currentPosition.y 
        };
    }
    return null;
}

function calculatePreviousPosition() {
    if (currentPosition.x > 0) {
        // Previous hole on the same row
        return { 
            x: currentPosition.x - 1, 
            y: currentPosition.y 
        };
    }
    return null;
}

function undoClicked() {
	undoLastMove();
}

function undoLastMove() {
    const previousPosition = calculatePreviousPosition();
    if (previousPosition !== null) {
        removePeg(previousPosition)
        currentPosition = previousPosition;
    }
}

function confirmClicked() {
    const currentRow = currentPosition.y;

    // Generate the answer
    const guess = readGuess(currentRow);
    const check = checkGuess(guess);
    const $answerSpan = $(`#answer${currentRow}`);
    for (let b = 0; b < check.blacks; b++) {
        $answerSpan.append(blackAnswerSvgHtml());
    }
    for (let w = 0; w < check.whites; w++) {
        $answerSpan.append(whiteAnswerSvgHtml());
    }

    // Check for game termination
    if (check.blacks === holes) {
        revealSolution();
        gameOver = true;
        $(".modal-title-gameover").text("YOU WON!!!");
        $(".modal-body-gameover").text("Congratulations. You guessed the pattern!");
        $("#gameOverModal").modal({backdrop: 'static'});
    } else if (currentRow >= rows - 1) {
        revealSolution();
        gameOver = true;
        $(".modal-title-gameover").text("Game Over");
        $(".modal-body-gameover").text("Sorry, game over...");
        $("#gameOverModal").modal({backdrop: 'static'});
    }

    // Disable the undo and confirm buttons
    disableUndo($(`#undoBtn${currentRow}`));
    disableConfirm($(`#okBtn${currentRow}`));

    // If not at the end, start a new row
    if (currentRow < rows - 1) {
        currentPosition = {
            x: 0, 
            y: currentRow + 1 
        };
        setHolesBackgroundColor(currentPosition.y);
    } else {
        setHolesBackgroundColor(-1);
    }
}

function readGuess(row) {
    let guess = [];
    for (let h = 0; h < holes; h++) {
        const $hole = $(`#hole${row}${h}`);
        const $pegSvg = $hole.children("svg").first();
        const $pegCircle = $pegSvg.children("circle").first();
        const pegColor = $pegCircle.data('color');
        guess = [...guess, pegColor];
    }
    return guess;
}

function checkGuess(guess) {
    let blacks = 0;
    let whites = 0;
    let guessedColors = [];
    for (let h = 0; h < holes; h++) {
        if (guess[h] === thePattern[h]) {
            blacks++;
            guessedColors = [...guessedColors, guess[h]];
        }
    }    
    // From the rules: "If there are duplicate colours in the guess, 
    // they cannot all be awarded a key peg unless they correspond 
    // to the same number of duplicate colours in the hidden code."
    // Since we don't allow duplicate colours in the pattern,
    // once a color was guessed, its duplicates won't be counted again:
    for (let h = 0; h < holes; h++) {
        if (guess[h] !== thePattern[h] && 
            thePattern.includes(guess[h]) && 
            !guessedColors.includes(guess[h])) {
            whites++;
            guessedColors = [...guessedColors, guess[h]];
        }
    }
    return { blacks: blacks, whites: whites };
}

function revealSolution() {
    $("#shieldRow").empty();
    $("#shieldRow").append(generateShieldRowHtml(true));
}
