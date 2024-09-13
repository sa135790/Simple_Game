


// Require Module 

const crypto = require('crypto');
const AsciiTable = require('ascii-table');

//Argument__Validator

const validateArguments = (args) => {
  if (args.length < 3 || args.length % 2 === 0) {
    throw new Error('Invalid number ');
  }
  if (new Set(args).size !== args.length) {
    throw new Error('Moves must be unique.');
  }
};

// HMAC__Generator

const generateKey = () => crypto.randomBytes(32).toString('hex');
const generateHMAC = (key, message) => crypto.createHmac('sha256', key).update(message).digest('hex');

// Game__Rules 

const getComputerMove = (moves) => moves[crypto.randomInt(moves.length)];

const determineWinner = (moves, playerMove, computerMove) => {
  const [pIdx, cIdx] = [moves.indexOf(playerMove), moves.indexOf(computerMove)];
  if (pIdx === cIdx) return 'Draw';

  const half = Math.floor(moves.length / 2);
  return (pIdx - cIdx + moves.length) % moves.length <= half ? 'Player Wins' : 'Computer Wins';
};

// game and user interaction.

class Game {
  constructor(moves) {
    this.moves = moves;
  }

  displayMenu() {
    console.log('Available moves:');
    this.moves.forEach((move, i) => console.log(`${i + 1} - ${move}`));
    console.log('0 - exit\n? - help');
  }

  displayHelp() {
    const table = new AsciiTable('Game Rules').setHeading('', ...this.moves);
    this.moves.forEach((move, i) => {
      table.addRow(move, ...this.moves.map((_, j) => 
        i === j ? 'Draw' : (i - j + this.moves.length) % this.moves.length <= Math.floor(this.moves.length / 2) ? 'Win' : 'Lose'));
    });
    console.log(table.toString());
  }

  play() {
    const key = generateKey();
    const computerMove = getComputerMove(this.moves);
    const hmac = generateHMAC(key, computerMove);

    console.log(`HMAC: ${hmac}`);
    this.displayMenu();

    process.stdin.on('data', (data) => {
      const input = data.toString().trim();
      if (input === '0') process.exit(0);
      if (input === '?') return this.displayHelp();

      const playerMoveIndex = parseInt(input, 10) - 1;
      if (isNaN(playerMoveIndex) || playerMoveIndex < 0 || playerMoveIndex >= this.moves.length) {
        console.log('Invalid choice, try again.');
      } else {
        const playerMove = this.moves[playerMoveIndex];
        const result = determineWinner(this.moves, playerMove, computerMove);
        console.log(`Your move: ${playerMove}\nComputer move: ${computerMove}\n${result}\nHMAC key: ${key}`);
        process.exit(0);
      }
      this.displayMenu();
    });
  }
}

// Main entry point

try {
  const moves = process.argv.slice(2);
  validateArguments(moves);
  new Game(moves).play();
} catch (error) {
  console.error(error.message);
}
