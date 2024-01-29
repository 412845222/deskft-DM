interface Step {
  stepIdx: number;
  tipStr: string;
  title: string;
}

let stepArr: Array<Step> = [
  {
    stepIdx: 0,
    tipStr: "等待游戏开始",
    title: "等待开始",
  },
  {
    stepIdx: 1,
    tipStr: "1. 请输入:颜色-编号,\n如：红色-1",
    title: "选球阶段",
  },
  {
    stepIdx: 2,
    tipStr: "2. 请输入:颜色-坐标-力度\n如：红色-a1-100",
    title: "弹射参数投票阶段",
  },
  {
    stepIdx: 3,
    tipStr: "4. 等待运动结束进入下一回合",
    title: "弹射阶段",
  },
];

export class GameProcess {
  stepList: Step[] = stepArr;
  stepIdx: number = 0;
  score: {
    red: number;
    blue: number;
  };
  constructor() {
    this.score = {
      red: 0,
      blue: 0,
    };
  }

  goalBall(team: string) {
    if (team == "red") {
      this.score.blue += 1;
    } else {
      this.score.red += 1;
    }
  }

  nextRound(): {
    restart: boolean;
    victory: string;
  } {
    this.stepIdx = 0;
    let res = {
      restart: false,
      victory: "",
    };
    //判断双方比分，如果有一方比分等于3，则游戏结束
    if (this.score.red == 3) {
      res.restart = true;
      res.victory = "red";
    }
    if (this.score.blue == 3) {
      res.restart = true;
      res.victory = "blue";
    }

    return res;
  }
}
