interface VoteCatapultDetail {
  gridPos: {
    first: {
      x: number;
      y: number;
      voteNum: number;
    };
    second: {
      x: number;
      y: number;
      voteNum: number;
    };
    third: {
      x: number;
      y: number;
      voteNum: number;
    };
  };
  power: {
    first: {
      power: number;
      voteNum: number;
    };
    second: {
      power: number;
      voteNum: number;
    };
    third: {
      power: number;
      voteNum: number;
    };
  };
}

interface VoteGridCount {
  x: number;
  y: number;
  voteNum: number;
}
interface VotePowerCount {
  power: number;
  voteNum: number;
}

export class VoteCatapult {
  redTeam: VoteCatapultDetail = default1;
  blueTeam: VoteCatapultDetail = default2;

  redGridVotePool: VoteGridCount[] = [];
  redPowerVotePool: VotePowerCount[] = [];

  blueGridVotePool: VoteGridCount[] = [];
  bluePowerVotePool: VotePowerCount[] = [];

  constructor() {}

  getTeamVoteResult(team: string): VoteCatapultDetail {
    if (team == "red") {
      return this.redTeam;
    } else {
      return this.blueTeam;
    }
  }

  voteCatapult(team: string, gridPos: {x:number,y:number}, power: number) {
    console.log("voteCatapult", team, gridPos, power);
    if (team == "red") {
      //判断GridVotePool是否已经投过票
      let isVoted_pos = false;
      for (let i = 0; i < this.redGridVotePool.length; i++) {
        if (this.redGridVotePool[i].x == gridPos.x && this.redGridVotePool[i].y == gridPos.y) {
          isVoted_pos = true;
          this.redGridVotePool[i].voteNum++;
          break;
        }
      }
      if (!isVoted_pos) {
        this.redGridVotePool.push({ x: gridPos.x, y: gridPos.y, voteNum: 1 });
      }

      //判断PowerVotePool是否已经投过票
      let isVoted_power = false;
      for (let i = 0; i < this.redPowerVotePool.length; i++) {
        if (this.redPowerVotePool[i].power == power) {
          isVoted_power = true;
          this.redPowerVotePool[i].voteNum++;
          break;
        }
      }
      if (!isVoted_power) {
        this.redPowerVotePool.push({ power: power, voteNum: 1 });
      }
    } else {
      //判断GridVotePool是否已经投过票
      let isVoted_pos = false;
      for (let i = 0; i < this.blueGridVotePool.length; i++) {
        if (this.blueGridVotePool[i].x == gridPos.x && this.blueGridVotePool[i].y == gridPos.y) {
          isVoted_pos = true;
          this.blueGridVotePool[i].voteNum++;
          break;
        }
      }
      if (!isVoted_pos) {
        this.blueGridVotePool.push({ x: gridPos.x, y: gridPos.y, voteNum: 1 });
      }

      //判断PowerVotePool是否已经投过票
      let isVoted_power = false;
      for (let i = 0; i < this.bluePowerVotePool.length; i++) {
        if (this.bluePowerVotePool[i].power == power) {
          isVoted_power = true;
          this.bluePowerVotePool[i].voteNum++;
          break;
        }
      }
      if (!isVoted_power) {
        this.bluePowerVotePool.push({ power: power, voteNum: 1 });
      }
    }
    //计算投票结果
    this.voteResult()
  }

  voteResult() {
    //计算投票结果
    let redGridVoteResult = this.voteResultGrid(this.redGridVotePool);
    let redPowerVoteResult = this.voteResultPower(this.redPowerVotePool);
    //判断长度是否够3个 否则内容为null
    if (redGridVoteResult.length < 3) {
      for (let i = redGridVoteResult.length; i < 3; i++) {
        redGridVoteResult.push({ x: 2, y: 7, voteNum: 0 });
      }
    }
    if (redPowerVoteResult.length < 3) {
      for (let i = redPowerVoteResult.length; i < 3; i++) {
        redPowerVoteResult.push({ power: 10, voteNum: 0 });
      }
    }
    this.redTeam = {
      gridPos: {
        first: redGridVoteResult[0],
        second: redGridVoteResult[1],
        third: redGridVoteResult[2],
      },
      power: {
        first: redPowerVoteResult[0],
        second: redPowerVoteResult[1],
        third: redPowerVoteResult[2],
      },
    };

    let blueGridVoteResult = this.voteResultGrid(this.blueGridVotePool);
    let bluePowerVoteResult = this.voteResultPower(this.bluePowerVotePool);
    //判断长度是否够3个 否则内容为null
    if (blueGridVoteResult.length < 3) {
      for (let i = blueGridVoteResult.length; i < 3; i++) {
        blueGridVoteResult.push({ x: 2, y: 0, voteNum: 0 });
      }
    }
    if (bluePowerVoteResult.length < 3) {
      for (let i = bluePowerVoteResult.length; i < 3; i++) {
        bluePowerVoteResult.push({ power: 10, voteNum: 0 });
      }
    }

    this.blueTeam = {
      gridPos: {
        first: blueGridVoteResult[0],
        second: blueGridVoteResult[1],
        third: blueGridVoteResult[2],
      },
      power: {
        first: bluePowerVoteResult[0],
        second: bluePowerVoteResult[1],
        third: bluePowerVoteResult[2],
      },
    };
  }

  voteResultGrid(votePool: VoteGridCount[]): VoteGridCount[] {
    //排序
    votePool.sort((a, b) => {
      return b.voteNum - a.voteNum;
    });
    //取前三
    let voteResult: VoteGridCount[] = [];
    for (let i = 0; i < 3; i++) {
      if (votePool[i]) {
        voteResult.push(votePool[i]);
      }
    }
    return voteResult;
  }

  voteResultPower(votePool: VotePowerCount[]): VotePowerCount[] {
    //排序
    votePool.sort((a, b) => {
      return b.voteNum - a.voteNum;
    });
    //取前三
    let voteResult: VotePowerCount[] = [];
    for (let i = 0; i < 3; i++) {
      if (votePool[i]) {
        voteResult.push(votePool[i]);
      }
    }
    return voteResult;
  }

  clearVotePool(){
    this.redGridVotePool = [];
    this.redPowerVotePool = [];
    this.blueGridVotePool = [];
    this.bluePowerVotePool = [];
    this.redTeam.gridPos.first.voteNum = 0;
    this.redTeam.gridPos.second.voteNum = 0;
    this.redTeam.gridPos.third.voteNum = 0;
    this.redTeam.power.first.voteNum = 0;
    this.redTeam.power.second.voteNum = 0;
    this.redTeam.power.third.voteNum = 0;
    this.blueTeam.gridPos.first.voteNum = 0;
    this.blueTeam.gridPos.second.voteNum = 0;
    this.blueTeam.gridPos.third.voteNum = 0;
    this.blueTeam.power.first.voteNum = 0;
    this.blueTeam.power.second.voteNum = 0;
    this.blueTeam.power.third.voteNum = 0;

  }
}

let default1: VoteCatapultDetail = {
  gridPos: {
    first: {
      x: 2,
      y: 7,
      voteNum: 0,
    },
    second: {
      x: 0,
      y: 0,
      voteNum: 0,
    },
    third: {
      x: 0,
      y: 0,
      voteNum: 0,
    },
  },
  power: {
    first: {
      power: 10,
      voteNum: 0,
    },
    second: {
      power: 0,
      voteNum: 0,
    },
    third: {
      power: 0,
      voteNum: 0,
    },
  },
};
let default2: VoteCatapultDetail = {
  gridPos: {
    first: {
      x: 3,
      y: 0,
      voteNum: 0,
    },
    second: {
      x: 0,
      y: 0,
      voteNum: 0,
    },
    third: {
      x: 0,
      y: 0,
      voteNum: 0,
    },
  },
  power: {
    first: {
      power: 10,
      voteNum: 0,
    },
    second: {
      power: 0,
      voteNum: 0,
    },
    third: {
      power: 0,
      voteNum: 0,
    },
  },
};

