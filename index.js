const TicTacToe = require('./TicTacToe');
const TwitterApi = require('./TwitterApi');
const fs = require('fs');
const wins = require('./wins.json');
const { arraysEqual, getHighestVote } = require('./utils');

const game = new TicTacToe();
const T = new TwitterApi();

async function waitForVotes() {
    return new Promise(resolve => {
        setTimeout(async () => {
            const votes = await T.getVotesFromTweet();
            
            resolve(votes);
        }, 1 * 60 * 1000);
    });
}

function getValidVotes(votes) {
    const filteredVotes = [];

    const availablePositions = game.getAvailablePositions();

    for (const vote of votes) {
        for (const availablePosition of availablePositions) {
            if (arraysEqual(vote, availablePosition)) {
                filteredVotes.push(vote);
                break;
            }
        }
    }

    return filteredVotes;
}

function getRandomPosition() {
    const availablePositions = game.getAvailablePositions();

    const randomPosition = availablePositions[Math.floor(Math.random() * availablePositions.length)];

    return randomPosition;
}

function makeComputerMovement() { // Rede neural avançada para fazer a melhor jogada possível 
    const computerPosition = getRandomPosition();

    const posX = computerPosition[0];
    const posY = computerPosition[1];

    game.place('O', posX, posY);

    return [posX, posY];
}

let inGame = false;

async function main() {
    if (inGame) return;
    inGame = true;

    console.log('Iniciando novo jogo');

    let winner;

    await T.postBoardImage('/img/velha.png', 'O jogo da velha está começando. Vote na casa que você queira que jogue:');

    do {
        let status;

        const allVotes = await waitForVotes();
        const validVotes = getValidVotes(allVotes);
        const mostVoted = getHighestVote(validVotes);

        let posX, posY;

        if (!Array.isArray(mostVoted)) {
            const randomPosition = getRandomPosition();

            posX = randomPosition[0];
            posY = randomPosition[1];

            status = `Não houve nenhum voto, então foi escolhido a posição X: ${posX+1}, Y: ${posY-1}`;
        } else {
            posX = mostVoted[0];
            posY = mostVoted[1];

            status = `A posição escolhida foi X: ${posX+1}, Y: ${posY+1}`;
        }

        game.place('X', posX, posY);

        winner = game.checkWinner();

        if (winner) continue;

        const computerMovement = makeComputerMovement();

        winner = game.checkWinner();

        if (winner) continue;

        const computerPosX = computerMovement[0];
        const computerPosY = computerMovement[1];

        await game.updateBoard();

        await game.getOutputBoard();

        status += `\nA Skynet jogou em X: ${computerPosX+1}, Y: ${computerPosY+1}\n\nA próxima jogada será em 1 minuto, votem!`;

        await T.postBoardImage('/output.png', status)

    } while (!winner);

    await game.updateBoard();

    await game.getOutputBoard();

    let status = `O jogo acabou! `;

    switch (winner) {
        case 'X':
            status += `Os usuários ganharam! Parabéns!`;
            wins.users++;

            break;
        case 'O':
            status += `A Skynet ganhou. :(`;
            wins.skynet++;

            break;
        case 'Velha':
            status += `O jogo deu velha!`;
            wins.velha++;

            break;
    }

    status += `\n\nO próximo jogo se iniciará em alguns minutos. Fique atento!`;

    await T.postBoardImage('/output.png', status);

    await game.resetBoard();

    fs.writeFileSync('wins.json', JSON.stringify(wins));

    await T.updateDescription(wins);

    inGame = false;
}

(async () => {
    await game.loadBoard();

    setInterval(main, 1 * 60 * 1000)
})();