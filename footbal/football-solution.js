const { TextParser, getFileInputData } = require("./../common");

class FootBallTeam {
  constructor(teamName, goalScored, goalTaken) {
    this.teamName = teamName.replace('_', ' ')
    this.goalScored = Number(goalScored)
    this.goalTaken = Number(goalTaken)
  }

  goalDifference() {
    return this.goalScored - this.goalTaken
  }
}

const createTeamsArray = (input)=> {
  if(!(input instanceof TextParser)) {
    throw new Error('Invalid input! You must enter an instance of TextParser class')
  }
  let teams = []
  for (let row of input.rows) {
      let team = new FootBallTeam(row.data.Team, row.data.F, row.data.A)
      teams.push(team);
  }
  return teams
}


const getMinGoalDiff = (teamsArr) => {
  let team = teamsArr[0]
  for (let i= 0; i < teamsArr.length; i++) {
    if(Math.abs(teamsArr[i].goalDifference()) < Math.abs(team.goalDifference())) {
      team = teamsArr[i]
      console.log('New team', team);
    }
  }
  return team;
}

async function main() {
  let input = await getFileInputData('football.dat');
  const parsedInput = new TextParser(input);
  parsedInput.setHeadFromLine(0, ["Team", "F", "A"]);
  parsedInput.createRows();
  let teams = createTeamsArray(parsedInput)
  let result = getMinGoalDiff(teams)
  console.log('Solution is:  ', result);
}

main();
