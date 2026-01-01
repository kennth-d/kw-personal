let statusText = null; //game-status span
let button = null; //play-restart-play again button element
let coin = null; //coin container element
let coinTossModal = null; //dialog element that contains the coin toss.
let cells = new Map(); //maps board object the the HTML board.

const board = {
    a1: 0x80080080, a2: 0x40008000, a3: 0x20000808,
    b1: 0x08040000, b2: 0x04004044, b3: 0x02000400,
    c1: 0x00820002, c2: 0x00402000, c3: 0x00200220,
};
const FULLBOARD = Object.values(board).reduce((acc, val) => acc | val, 0);

const solutions = {
    //rows
    0x40000000: ['a1', 'a2', 'a3'],
    0x04000000: ['b1', 'b2', 'b3'],
    0x00400000: ['c1', 'c2', 'c3'],

    //columns
    0x00040000: ['a1', 'b1', 'c1'],
    0x00004000: ['a2', 'b2', 'c2'],
    0x00000400: ['a3', 'b3', 'c3'],

    //diagonals
    0x00000040: ['a1', 'b2', 'c3'],
    0x00000004: ['a3', 'b2', 'c1'],
}
function getWinningCells(board) {
    let res = solutions[board];

    // multiple solutions
    if (res === undefined) {
        res = new Set();
        Object.keys(solutions).forEach(key => {
            const mask = Number(key);
            if ((board & mask) === mask) solutions[key].forEach(cell => res.add(cell));
        });
    }
    return res;
}
/**
 *   Game Clock:
 *   - tracks seconds and minutes.
 *   - updates the HTML Elements for displaying time.
 *   - resets to 00:00 after 99:59.
 */
let clock = {
    //span elements
    minutes: null,
    seconds: null,

    ticks: 0,

    update() {
        this.ticks++;

        if ((this.ticks % game.tickRate) === 0) {

            let seconds = parseInt(this.seconds.innerHTML);
            let minutes = parseInt(this.minutes.innerHTML);

            if (seconds == 59) {
                minutes = (minutes != 99) ? ++minutes : 0;
                seconds = 0;
            } else {
                seconds++;
            }//end if-else

            this.minutes.innerHTML = minutes.toString().padStart(2, '0');
            this.seconds.innerHTML = seconds.toString().padStart(2, '0');
        }//end if-else
    },
    reset() {
        this.minutes.innerHTML = '00';
        this.seconds.innerHTML = '00';
    }
};// end clock
let game = {
    vsCPU: false, 
    matchInProgress: false,
    currentTurn: null,
    first: null,
    markedCells: new Set(),

    x: 0, //x's marked cells
    o: 0, //o's marked cells

    //control variables for updating the game
    intervalID: null,
    tickRate: 1, //updates per second
    updateInterval: null, //ms

    start(first) {
        //initialize updateInterval
        if (!this.updateInterval) {
            this.updateInterval = Math.floor(1000/this.tickRate);
        }

        changeBtnState('Restart');

        this.setTurn(first);
        this.first = first;
        
        let versusOption = document.querySelector('input[name="versus"]:checked').value;
        this.vsCPU = (versusOption === 'cpu') ? true : false;

        this.intervalID = setInterval(this.update.bind(this), this.updateInterval);

        this.matchInProgress = true;
    },
    update() {
        clock.update();

        if (this.isCpuTurn()) {
            let move = getbestMove(this.x, this.o);
            handleCellEvent(cells.get(move));
        }
    },
    end(winner, winCondition) {
        this.matchInProgress = false;
        clearInterval(this.intervalID);

        if (winner) {
            statusText.innerHTML = `${winner} has won.`;

            winCondition.forEach( cell => {
                cells.get(cell).classList.add('win');
            });

        } else  {
            statusText.innerHTML = "Cat's game";
        }

        changeBtnState('Play Again');

    },
    setTurn(symbol) {
        this.currentTurn = symbol;
        statusText.innerHTML = `It is ${game.currentTurn.toUpperCase()}'s turn`;
    },
    isCpuTurn() {
        return (this.vsCPU && this.currentTurn === 'o');
    },
    hasWon(board) {
        return board & (board << 1) & (board >>> 1);
    },
    checkForWinner() {
        let winner = null;
        let winIndeces = null;

        let x = this.hasWon(this.x);
        if (x) {
            winner = 'X';
            winIndeces = getWinningCells(x);
        }
        
        let o = this.hasWon(this.o);
        if (o) {
            winner = 'O';
            winIndeces = getWinningCells(o);
        }
        
        let noMoreCells = (this.x | this.o) === FULLBOARD;
        if (winner) {
            this.end(winner, winIndeces);
        } else if (noMoreCells) {
            this.end('', "Cat's game");
        }//end if-else-if
    },
    isCellEmpty(cell) {
        return this.markedCells.has(cell);
    },
    markCell(cell) {
        this.markedCells.add(cell);
    }
}
/** event handler for the button element.
 * #### on play:
 * - shows the coin toss modal
 * #### on restart:
 * - resets the game state
 * - calls game.start
 * #### on play again:
 * - resets the game state
 * - shows the coin toss modal
 */
function handleBtn() {
    switch(button.dataset.state.toLowerCase()) {
        case 'play':
            coinTossModal.showModal();
            break;
        case 'restart':
            game.x = game.o = 0b000_000_000;

            cleanCells();

            clearInterval(game.intervalID);

            clock.reset();

            game.start(game.first);
            break;
        case 'play again':
            game.x = game.o = 0b000_000_000;

            cleanCells();

            clock.reset();

            coin.addEventListener('click', flipCoin, {once: true});

            coinTossModal.showModal();

    }//end switch
}
function changeBtnState(newState) {
    button.dataset.state = newState;
    button.innerHTML = newState;
}
/**
 * #### if cellElement is unmarked:
 * - updates the cell as marked.
 * - prompts the game to check for a winner.
 * - if game isn't ended, changes game's currentTurn.
 * 
 * #### if cellElement has been previously marked:
 * - does nothing.
 * @param {HTMLSpanElement} cellElement the element to be marked.
 */
function handleCellEvent(cell) {
    const marked = game.isCellEmpty(cell.id);

    if (!marked) {
        game.markCell(cell.id);
        cell.innerHTML = game.currentTurn.toUpperCase();
        cell.classList.add('marked');

        game[game.currentTurn] |= board[cell.id];
        game.checkForWinner();

        if (game.matchInProgress) {
            let next = (game.currentTurn === 'x') ? 'o' : 'x';
            game.setTurn(next);
        }//end if

    }//end if
}
/**
 * Restores the Span elements (cells) to their pre-game state.
 */
function cleanCells() {
    game.markedCells = new Set();
    cells.forEach((cell) => {
        cell.innerHTML = '';
        cell.classList.remove('marked');
        cell.classList.remove('win');
    });
}
/**
 * Plays a coin flip animation.
 * Shortly after the animation is complete,
 * the modal is closed and the game is started.
 */
function flipCoin() { 
    let flip = Math.random();

    let first = (flip <= 0.5) ? 'x' : 'o';

    coin.style.animation = `flip-${first} 3s forwards`;

    setTimeout(() => {
        coinTossModal.close()
        game.start(first);
        coin.style.animation = "";
    }, 4000);
}
function getbestMove(xb, ob) {
    let best = -Infinity;
    let bestMove = null;

    for (const move of getAvailableMoves(xb, ob)) {
        let score = minimax(xb, ob | board[move], false);
        if (score > best) {
            best = score;
            bestMove = move;
        }
    }
    return bestMove;
}
function getAvailableMoves(xb, ob) {
    let occupied = xb | ob;
    return Object.keys(board).filter(cell => (board[cell] & occupied) === 0)
}
function minimax(xb, ob, maximizing=true) {
    if (game.hasWon(ob)) return 1;
    if (game.hasWon(xb)) return -1;
    if ((xb | ob) === FULLBOARD) return 0;

    const moves = getAvailableMoves(xb, ob);

    if (maximizing) {
        let bestScore = -Infinity;
        for (const move of moves) {
            let score = minimax(xb, ob | board[move], false);
            bestScore = Math.max(bestScore, score);
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (const move of moves) {
            let score = minimax(xb | board[move], ob, true);
            bestScore = Math.min(bestScore, score);
        }
        return bestScore;
    }
}
window.addEventListener('load', () => {
    
    //get the HTML elements
    statusText = document.querySelector("#game-status");
    button = document.querySelector('#btn')
    coin = document.querySelector('.coin');
    coinTossModal = document.querySelector('#coin-toss');
    clock.minutes = document.querySelector('#minutes'),
    clock.seconds = document.querySelector('#seconds'),

    //add the event listeners
    button.addEventListener('click', handleBtn);

    coin.addEventListener('click', flipCoin, {once: true});

    Array.from(document.querySelector('#board').children).forEach(cell => {
        cells.set(cell.id, cell);
        cell.addEventListener('click', e => {
            if (game.matchInProgress && !game.isCpuTurn()) handleCellEvent(e.currentTarget);
        });
    });
});