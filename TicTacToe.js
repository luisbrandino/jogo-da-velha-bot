const fs = require('fs');
const { X, Y } = require('./positions.json');
const { createCanvas, loadImage } = require('canvas');

class TicTacToe {
    constructor() {
        const width = 345;
        const height = 267;

        const canvas = createCanvas(width, height);
        const context = canvas.getContext('2d');

        this.canvas = canvas;
        this.context = context;

        this.game = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];
    }

    async loadBoard() {
        const board = await loadImage('./img/velha.png');

        this.context.drawImage(board, 0, 0, 345, 267);
    }

    place(letter, indexX, indexY) {
        const board = this.game;

        if (letter.toLowerCase() != 'x' && letter.toLowerCase() != 'o') return;

        if (!(indexX >= 0 && indexX <= 2)) return; // Index X inválido (somente entre 0 e 2)
        if (!(indexY >= 0 && indexY <= 2)) return; // Index Y inválido (somente entre 0 e 2)

        if (board[indexY][indexX]) return; // Já existe uma letra na posição

        board[indexY][indexX] = letter.toUpperCase();
    }

    async resetBoard() {
        this.game = [
            ['', '', ''],
            ['', '', ''],
            ['', '', '']
        ];

        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        await this.loadBoard();
    }

    async updateBoard() {
        const board = this.game;

        for (let i = 0; i < board.length; i++) {
            for (let y = 0; y < board[i].length; y++) {
                let letter = board[i][y];

                if (!letter) continue;

                const posX = X[y];
                const posY = Y[i];

                const letterImg = await loadImage(`./img/${letter.toUpperCase()}.png`);

                this.context.drawImage(letterImg, posX, posY, 70, 70);
            }
        }

        
    }

    checkWinner() {
        const board = this.game;

        if (board[0][0] == 'X' && board[1][1] == 'X' && board[2][2] == 'X') return 'X'; // X ganhou diagonalmente
        if (board[0][2] == 'X' && board[1][1] == 'X' && board[2][0] == 'X') return 'X'; // X ganhou diagonalmente

        if (board[0][0] == 'O' && board[1][1] == 'O' && board[2][2] == 'O') return 'O'; // O ganhou diagonalmente
        if (board[0][2] == 'O' && board[1][1] == 'O' && board[2][0] == 'O') return 'O'; // O ganhou diagonalmente

        for (const row of this.game) {
            let x = 0, o = 0;

            row.map(v => v == 'X' ? ++x : v == 'O' ? ++o : false);

            if (x == 3) {
                return 'X'; // X ganhou horizontalmente
            }

            if (o == 3) {
                return 'O'; // O ganhou horizontalmente
            }
        }

        let x = 0, o = 0, remainingPlay = false;

        for (let i = 0; i < board.length; i++) {
            for (let y = 0; y < board[i].length; y++) {
                if (board[y][i] == 'X') {
                    x++;
                }

                if (board[y][i] == 'O') {
                    o++;
                }

                if (!board[y][i]) {
                    remainingPlay = true;
                }
            }

            if (x == 3) {
                return 'X'; // X ganhou verticalmente
            }

            if (o == 3) {
                return 'O'; // O ganhou verticalmente
            }

            x = 0;
            o = 0;
        }

        if (!remainingPlay) {
            return 'Velha';
        }

        return null; // Ninguém ganhou ainda
    }

    getAvailablePositions() {
        const board = this.game;
        const availablePositions = [];

        for (let i = 0; i < board.length; i++) {
            for (let y = 0; y < board[i].length; y++) {
                const currentPosition = board[i][y];

                if (currentPosition) continue;

                const boardPosition = [y, i];

                availablePositions.push(boardPosition);
            }
        }

        return availablePositions;
    }

    async getOutputBoard() {
        const buffer = this.canvas.toBuffer('image/png');
        fs.writeFileSync('./output.png', buffer);
    }
}

module.exports = TicTacToe;