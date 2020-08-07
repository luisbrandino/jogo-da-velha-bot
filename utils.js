function arraysEqual(a, b) {
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (!(a[i] == b[i])) return false;
    }

    return true;
}

function getHighestVote(votes) { // gambiarra q eu fiz, talvez eu refatore dps
    const eachVote = [];

    for (const vote of votes) {
        let alreadyInArray = false;

        for (const singleVote of eachVote) {
            if (arraysEqual(vote, singleVote.vote)) {
                alreadyInArray = true;
                break;
            }
        }

        if (alreadyInArray) continue;

        eachVote.push({
            vote,
            timesVoted: 0
        });
    }

    for (const singleVote of eachVote) {
        for (const vote of votes) {
            if (arraysEqual(vote, singleVote.vote)) {
                singleVote.timesVoted++;
            }
        }
    }

    let mostTimesVoted = 0;
    let mostVoted;

    for (const singleVote of eachVote) {
        if (singleVote.timesVoted > mostTimesVoted) {
            mostTimesVoted = singleVote.timesVoted;
            mostVoted = singleVote.vote;
        }
    }

    return mostVoted;
}

module.exports = {
    arraysEqual,
    getHighestVote
};