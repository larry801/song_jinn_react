import {getStateById} from "../auto/util";

export function getPlanByID(id) {
    return plans[id];
}

const plans = [
    {
        id: 0, name: "",
        desc: "",
        effect: (G, ctx, arg) => G,
        level: 0,
        provinces: [],
        vp: 0,
    },{
        id: 1,
        name: "早期京畿路",
        desc: "核心/目标：开封   其他城市：无   首次完成/奖励选取奖励：下一个摸牌阶段，通过检索获得1张手牌，然后弃掉1张手牌",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 2,
        name: "早期陕西六路",
        desc: "核心/目标：长安   其他城市：天兴 肤施   首次完成/奖励选取奖励：提高【军事等级】1级",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 3,
        name: "早期京西两路",
        desc: "核心/目标：襄阳   其他城市：洛阳宛丘   首次完成/奖励选取奖励：提高【政策】/【殖民】1级",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 4,
        name: "早期京东两路",
        desc: "核心/目标：宋城   其他城市：历城须城   首次完成/奖励选取奖励：调整1个其他国家【外交】状态1级",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 5,
        name: "早期淮南两路",
        desc: "核心/目标：江都   其他城市：下蔡   首次完成/奖励选取奖励：提高【内政等级】1级",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 6,
        name: "早期河东路",
        desc: "核心/目标：阳曲   其他城市：临汾上党   首次完成/奖励选取奖励：消灭总共2耐久度的部队",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 7,
        name: "中期京畿路",
        desc: "核心/目标：开封   其他城市：无   首次完成/奖励选取奖励：下一个摸牌阶段，通过检索获得1张手牌，然后弃掉1张手牌",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 8,
        name: "中期陕西六路",
        desc: "核心/目标：长安   其他城市：   首次完成/奖励选取奖励：提高【军事等级】1级",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 9,
        name: "中期淮南两路",
        desc: "核心/目标：江都   其他城市：下蔡   首次完成/奖励选取奖励：提高【内政等级】1级",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 10,
        name: "中期京西两路",
        desc: "核心/目标：襄阳   其他城市：洛阳宛丘   首次完成/奖励选取奖励：提高【政策】，【殖民】1级",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 11,
        name: "中期荆湖两路",
        desc: "核心/目标：江陵   其他城市：长沙安陆   首次完成/奖励选取奖励：提供4点【发展力】",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 12,
        name: "中期川峡四路",
        desc: "核心/目标：成都   其他城市：南郑 郪县   首次完成/奖励选取奖励：摸1张牌",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 13,
        name: "中期京东两路",
        desc: "核心/目标：宋城   其他城市：历城须城   首次完成/奖励选取奖励：调整1个其他国家【外交】状态1级",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 14,
        name: "中期江西两路",
        desc: "核心/目标：江宁   其他城市：南昌   首次完成/奖励选取奖励：提高【政策】/【殖民】1级",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 15,
        name: "中期河北两路",
        desc: "核心/目标：元城   其他城市：真定 安喜 河间   首次完成/奖励选取奖励：在【元城】放置1个【拐子马】/【背嵬军】",
        effect: (G, ctx, arg) => G,
        level: 2,
        provinces: [],
        vp: 1,
    },
    {
        id: 16,
        name: "中期川陕战区",
        desc: "核心/目标：长安   其他城市：天兴 肤施 南郑 郪县   首次完成/奖励选取奖励：将1个在场的【将领】移出游戏",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 4,
    },
    {
        id: 17,
        name: "中期荆襄战区",
        desc: "核心/目标：襄阳开封   其他城市：洛阳宛丘   首次完成/奖励选取奖励：将1个已完成的【作战计划】移出游戏",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 4,
    },
    {
        id: 18,
        name: "中期两淮战区",
        desc: "核心/目标：江都宋城   其他城市：历城须城下蔡   首次完成/奖励选取奖励：将1个其他国家移出游戏",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 4,
    },
    {
        id: 19,
        name: "后期京畿路",
        desc: "核心/目标：开封   其他城市：无   首次完成/奖励选取奖励：无",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 3,
    },
    {
        id: 20,
        name: "后期陕西六路",
        desc: "核心/目标：长安   其他城市：   首次完成/奖励选取奖励：无",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 3,
    },
    {
        id: 21,
        name: "后期淮南两路",
        desc: "核心/目标：江都   其他城市：下蔡   首次完成/奖励选取奖励：下回合可以选取2张【作战计划】",
        effect: (G, ctx, arg) => G,
        level: 3,
        provinces: [],
        vp: 2,
    },
    {
        id: 22,
        name: "后期京西两路",
        desc: "核心/目标：襄阳   其他城市：洛阳宛丘   首次完成/奖励选取奖励：无",
        effect: (G, ctx, arg) => G,
        level: 4,
        provinces: [],
        vp: 3,
    },
    {
        id: 23,
        name: "还我河山",
        desc: "核心/目标：长安 宋城 元城 开封    其他城市：肤施天兴须城历城河间安喜真定   首次完成/奖励选取奖励：自动获胜；若未完成，当【绍兴和议】时，每座计划内的城市1分",
        effect: (G, ctx, arg) => G,
        level: 5,
        provinces: [],
        vp: 0,
    },
    {
        id: 24,
        name: "吴山立马",
        desc: "核心/目标：江宁襄阳江都开封   其他城市：下蔡南昌洛阳宛丘   首次完成/奖励选取奖励：自动获胜；若未完成，当【绍兴和议】时，每座计划内的城市1分",
        effect: (G, ctx, arg) => G,
        level: 5,
        provinces: [],
        vp: 0,
    },
]
export function canChoosePlan(G,ctx,plan,player){
    if (G.songPlayer === player && plan === 24){
        return false;
    }
    if (G.jinnPlayer === player && plan === 23) {
        return false;
    }
    let pub = getStateById(G,ctx,player);
    let card = getPlanByID(plan);
    return card.level <= pub.military;
}
