export interface VoteDetail {
  first: {
    ballIdx: number;
    voteNum: number;
  };
  second: {
    ballIdx: number;
    voteNum: number;
  };
  third: {
    ballIdx: number;
    voteNum: number;
  };
}

let default1: VoteDetail = {
  first: {
    ballIdx: 0,
    voteNum: 0,
  },
  second: {
    ballIdx: 0,
    voteNum: 0,
  },
  third: {
    ballIdx: 0,
    voteNum: 0,
  },
};
let default2: VoteDetail = {
  first: {
    ballIdx: 0,
    voteNum: 0,
  },
  second: {
    ballIdx: 0,
    voteNum: 0,
  },
  third: {
    ballIdx: 0,
    voteNum: 0,
  },
};

interface VoteCount {
  ballIdx: number;
  voteNum: number;
}

export class VoteBall {
  redTeam: VoteDetail = default1;
  blueTeam: VoteDetail = default2;
  votePool_red: VoteCount[] = [];
  votePool_blue: VoteCount[] = [];
  constructor() {}

  getTeamVoteDetail(team: string): VoteDetail {
    if (team == "red") {
      this.voteResult();
      return this.redTeam;
    } 
    if (team == "blue") {
      this.voteResult();
      return this.blueTeam;
    }
  }

  clearVotePool(){
    this.votePool_red = [];
    this.votePool_blue = [];
    this.redTeam.first.voteNum = 0;
    this.redTeam.second.voteNum = 0;
    this.redTeam.third.voteNum = 0;
    this.blueTeam.first.voteNum = 0;
    this.blueTeam.second.voteNum = 0;
    this.blueTeam.third.voteNum = 0;
  }

  voteBall(team: string, ballIdx: number) {
    if (team == "red") {
      console.log("red", team, ballIdx);
      //判断是否已经投过票
      let isExist = false;
      this.votePool_red.forEach((item) => {
        if (item.ballIdx == ballIdx) {
          isExist = true;
          item.voteNum += 1;
        }
      });
      if (!isExist) {
        this.votePool_red.push({
          ballIdx: ballIdx,
          voteNum: 1,
        });
      }
    }

    if (team == "blue") {
      console.log("blue", team, ballIdx);
      //判断是否已经投过票
      let isExist = false;
      this.votePool_blue.forEach((item) => {
        if (item.ballIdx == ballIdx) {
          isExist = true;
          item.voteNum += 1;
        }
      });
      if (!isExist) {
        this.votePool_blue.push({
          ballIdx: ballIdx,
          voteNum: 1,
        });
      }
    }
  }

  //计算投票结果
  voteResult() {
    let redTeam = this.redTeam;
    let blueTeam = this.blueTeam;
    let votePool_red = this.votePool_red;
    let votePool_blue = this.votePool_blue;
    //计算红队票池中index出现次数 前三名
    if (votePool_red.length > 0) {
      let votePool_red_sort = votePool_red.sort((a, b) => {
        return b.voteNum - a.voteNum;
      });

      let first = votePool_red_sort[0];
      let second = votePool_red_sort[1];
      let third = votePool_red_sort[2];
      redTeam.first.ballIdx = first.ballIdx;
      redTeam.first.voteNum = first.voteNum;

      if (!second) {
        redTeam.second.ballIdx = null;
        redTeam.second.voteNum = 0;
      } else {
        redTeam.second.ballIdx = second.ballIdx;
        redTeam.second.voteNum = second.voteNum;
      }

      if (!third) {
        redTeam.third.ballIdx = null;
        redTeam.third.voteNum = 0;
      } else {
        redTeam.third.ballIdx = third.ballIdx;
        redTeam.third.voteNum = third.voteNum;
      }
    }

    //计算蓝队票池中index出现次数 前三名
    if (votePool_blue.length > 0) {
      let votePool_blue_sort = votePool_blue.sort((a, b) => {
        return b.voteNum - a.voteNum;
      });

      let first = votePool_blue_sort[0];
      let second = votePool_blue_sort[1];
      let third = votePool_blue_sort[2];
      blueTeam.first.ballIdx = first.ballIdx;
      blueTeam.first.voteNum = first.voteNum;

      if (!second) {
        blueTeam.second.ballIdx = null;
        blueTeam.second.voteNum = 0;
      } else {
        blueTeam.second.ballIdx = second.ballIdx;
        blueTeam.second.voteNum = second.voteNum;
      }

      if (!third) {
        blueTeam.third.ballIdx = null;
        blueTeam.third.voteNum = 0;
      } else {
        blueTeam.third.ballIdx = third.ballIdx;
        blueTeam.third.voteNum = third.voteNum;
      }
    }

    this.redTeam = redTeam;
    this.blueTeam = blueTeam;
    
  }
}
