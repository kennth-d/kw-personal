/**
 * 32-bit tic tac toe board representation.
 * Credit: https://stackoverflow.com/questions/1056316/algorithm-for-determining-tic-tac-toe-game-over
 * username: Gary C
 */


function getPaddedString(integer) {
    let bitArray = (integer >>> 0).toString(2).padStart(32, '0').split('');
    for (let i = 1; i < bitArray.length + 1; i++) {
        if (i % 4 == 0) {
            bitArray[i-1] = ' ' + bitArray[i-1] + ' ';
            counter = 0;
        }
    }
    return bitArray.join('');
}
const board = {
    a1: 0x80080080, a2: 0x40008000, a3: 0x20000808,
    b1: 0x08040000, b2: 0x04004044, b3: 0x02000400,
    c1: 0x00820002, c2: 0x00402000, c3: 0x00200220,
};

const FULLBOARD = Object.values(board).reduce((acc, val) => acc | val);
console.log('FULLBOARD: ', getPaddedString(FULLBOARD));

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
function getAvailableMoves(xb, ob) {
    let occupied = xb | ob;
    return Object.keys(board).filter(cell => (board[cell] & occupied) === 0)
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

function logBoards(x, o) {
    console.log('xb: ', getPaddedString(x));
    console.log('ob: ', getPaddedString(o));
}


let xb;
let ob;
//Example of a win using X's board.
//add the first row to X's board
xb = board.a1 | board.a2 | board.a3;

console.log(
    '+----------------------------+\n' +
    '|  32-bit tic-tac-toe board  |\n' +
    '+----------------------------+\n\n' +

    '+--------------------+\n' +
    '|  a1  |  a2  |  a3  |\n' +
    '+--------------------+\n' +
    '|  b1  |  b2  |  b3  |\n' +
    '+--------------------+\n' +
    '|  c1  |  c2  |  c3  |\n' +
    '+--------------------+\n\n' +

    'the board: [000] 0 [000] 0 [000] 0 [000] 0 [000] 0 [000] 0 [000] 0 [000]\n\n' + 
    '[1st row] 0 [2nd row] 0 [3rd row] 0 [1st column] 0 [2nd column] 0 [3rd column] 0 [1st diagonal] 0 [2nd diagonal]\n\n' +
    'example: to mark cell b2 it is in the 2nd row, 2nd column, and both diagonals.\n' +
    'mask: 000 0 010 0 000 0 000 010 000 0 010 0 010\n'
)

console.log('testing board xb with cells: a1, a2, a3');
//check for a win
//merge the bits by ANDing its left/right shifted equivalents.
let win = xb & (xb << 1) & (xb >>> 1); //must use unsigned right shift
let condition = solutions[win];
let res = getWinningCells(win);

console.log('xb:', getPaddedString(xb));
console.log('win:', getPaddedString(win));
console.log('win condition:', condition);
console.log('res: ', res, '\n');

console.log('testing board xb with cells: a1, a2, a3, b1, c1');
xb |= board.b1;
xb |= board.c1;
win = xb & (xb << 1) & (xb >>> 1);
condition = solutions[win];
res = getWinningCells(win);
console.log('xb:', getPaddedString(xb));
console.log('win:', getPaddedString(win));
console.log('win condition:', condition, '\n');
console.log('res: ', res, '\n');


//lets try with O's board
ob = board.b1 | board.c3 | board.c2;

console.log('testing ob with cells: b1, c3, c2');
console.log('ob:', getPaddedString(ob));
win = ob & (ob << 1) & (ob >>> 1);
console.log('win:', getPaddedString(win));

//check for an empty space.
function isEmpty(cell) {
    return (board[cell] & (xb | ob)) === 0;
}

console.log('\n-- isEmpty test -- ');
console.log('b2:', isEmpty('b2'));//should be true
console.log('b3', isEmpty('b3')); //should be true
console.log('a1', isEmpty('a1')); //should be false
console.log('c3', isEmpty('c3')); //should be false


console.log('\n -- full board test -- ');
const fullboard = Object.values(board).reduce((acc, val) => acc | val, 0);
console.log(getPaddedString(fullboard));

console.log('\n\ngetAvailableMoves Test');
xb = board.a1 | board.a2 | board.a3;
ob = board.c1 | board.c2 | board.c3;

logBoards(xb, ob);
console.log('xb: a1, a2, a3');
console.log('ob: c1, c2, c3');
console.log('available moves: ', getAvailableMoves(xb, ob));

function getbestMove(xb, ob) {
    let best = -Infinity;
    let bestMove = null;

    for (const move of getAvailableMoves(xb, ob)) {
        let score = minimax(xb, ob | board[move], false);
        console.log(`move: ${move}, score: ${score}`)
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
    if (hasWon(ob)) return 1;
    if (hasWon(xb)) return -1;
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

function hasWon(board) {
    return board & (board << 1) & (board >>> 1);
};

console.log('\n\nMinimax Test');

xb = board.c1 | board.b3;
ob = board.a1 | board.a3;
console.log('xb: c1, b3');
console.log('ob: a1, a3');
console.log('ob best move:', getbestMove(xb, ob), '\n');

xb = board.c1 | board.c2;
ob = board.a1 | board.b3;

console.log('xb: c1, c2');
console.log('ob: a1, b3');
console.log('ob best move: ', getbestMove(xb, ob));