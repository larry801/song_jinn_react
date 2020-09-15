import {INITIAL_RECRUIT_COST, INITIAL_RECRUIT_PERMISSION} from "../constants/general";

/*
*
* 宋：
30步，30弓，10骑，5船，3炮，5背
金：
15步，20拐，20铁，5船，3鹅，15签，10齐
* */
export function setupGame(ctx, setupData) {
    let initialState = {
        playerOrder : ['0','1'],
        orderChosen:false,
        optionalCard:false,
        useCombatResultTable:false,
        roundMarker: 1,
        turnMarker: 1,
        songPlayer: '0',
        jinnPlayer: '1',
        // Full log https://github.com/boardgameio/boardgame.io/issues/795
        workAroundIssue795:false,
        pending:{
            endTurn:false,
            endPhase:false,
            endStage:false,
        },
        /*
        仅当前玩家可见状态 比如手牌
         */
        player: {
            '0': {
                hands: [],
                combatCards:[],
                chosenPlans: [],
                availablePlans: [],
                developCardDetail:[],
                letterOfCredenceDetail: {
                    '西辽': [],
                    '西夏': [],
                    '吐蕃': [],
                    '大理': [],
                    '高丽': []
                }
            }, '1': {
                hands: [],
                combatCards:[],
                chosenPlans: [],
                availablePlans: [],
                developCardDetail:[],
                letterOfCredenceDetail: {
                    '西辽': [],
                    '西夏': [],
                    '吐蕃': [],
                    '大理': [],
                    '高丽': []
                }
            }
        },

        recruitCost: INITIAL_RECRUIT_COST,
        recruitPermission: INITIAL_RECRUIT_PERMISSION,
        opForRecruitAndMarch: 0,
        eventActionInfo: {},
        combatInfo:{
            mountainPass:0,
            isRoundTwo:false,
            pendingCombat:false,
            stage:"noCombat",
            isSiege:false,
            isBreakthrough:false,
            isField:false,
            isRescue:false,
            generalOneTimeSkill:[],
            song:{
                pendingDamage:3,
                combatCards:[],
                dices:[],
                troop:{
                    units: [2, 2, 0, 0, 0, 0],
                    general: [],
                    region: 0,
                    city: 0,
                },
                isAttacker:false,
                beatGongChoice:"",
            },
            jinn:{
                pendingDamage:0,
                combatCards:[],
                dices:[],
                troop:{
                    units: [0, 0, 0, 0, 0, 0, 0],
                    general: [],
                    region: 0,
                    city: 0,
                },
                isAttacker:false,
                beatGongChoice:"",
            }
        },
        /*
        公开显示的状态
         */
        song: {
            developCards:[],
            combatCardChosen:false,
            movedTroops:{},
            generals:{
              "宗泽":{present:true,hasSkill:false},
              "岳飞":{present:false,hasSkill:false},
              "韩世忠":{present:false,hasSkill:false},
              "李显忠":{present:false,hasSkill:false},
              "吴玠":{present:false,hasSkill:false},
              "吴磷":{present:false,hasSkill:false},
            },
            planChosen:false,
            emperor:{exist:true,city:21},
            corruption: 2, military: 2, civil: 3, policy:-2,
            currentPlans: [],
            activeEvents: [],
            lastTurnPlans:[],
            recruitCost: [1,1,0,2,0,0],
            recruitPermission:[true,true,false,true,false,false],
            supplementBank: [0, 0, 0, 0, 0, 0, []],
            discard: [], remove: [],
            reserveBank: [19, 18, 9, 2, 3, 5], completedPlans: [],
            regions:[],
            provinces:[7,8,9,10,11,12,13,14,15,16],
            cities:[12,13,14,15,16,17,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35],
            troops:[
                {units:[2,2,0,0,0,0],city:0,region:19,mountainPass:"",otherCountry:"",general:["宗泽"]},

                {units:[0,1,0,0,0,0],city:12,region:21,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,1,0,0,0,0],city:14,region:28,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,0,0,0,0,0],city:15,region:32,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,1,0,0,0,0],city:16,region:33,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,1,1,0,0,0],city:17,region:36,mountainPass:"",otherCountry:"",general:[]},
                {units:[2,1,0,0,0,0],city:20,region:42,mountainPass:"",otherCountry:"",general:[]},
                {units:[2,3,0,0,0,0],city:21,region:43,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,0,0,1,0,0],city:22,region:46,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,0,0,0,0,0],city:23,region:48,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,0,0,0,0,0],city:25,region:54,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,1,0,0],city:27,region:60,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,1,0,0,0,0],city:30,region:66,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,1,0,0],city:32,region:72,mountainPass:"",otherCountry:"",general:[]},
                {units:[1,0,0,0,0,0],city:35,region:77,mountainPass:"",otherCountry:"",general:[]},
            ]
        }, jinn: {
            developCards:[],
            combatCardChosen:false,
            movedTroops:{},
            generals:{
                "斡离不":{present:true,hasSkill:true},
                "粘罕":{present:true,hasSkill:true},
                "兀术":{present:false,hasSkill:false},
                "银术可":{present:false,hasSkill:false},
                "娄室":{present:true,hasSkill:true},
                "奔睹":{present:false,hasSkill:true},
            },
            planChosen:false,
            emperor:{exist:true,city:3},
            corruption: 0, military: 3, civil: 2, colonization:0,
            currentPlans: [],
            activeEvents: [],
            lastTurnPlans:[],
            recruitCost: [1,2,2,0,0,1,1],
            recruitPermission:  [true,true,true,false,false,true,false],
            supplementBank: [0, 0, 1, 0, 0, 0, 0, []],
            discard: [], remove: [],
            reserveBank: [5, 16, 17, 5, 1, 10, 10], completedPlans: [],
            regions:[],provinces:[1,2,3,4,5,6],
            cities:[],
            troops:[
                {units:[1,2,1,0,1,0,0],city:0,region:20,mountainPass:"",otherCountry:"",general:["斡离不"]},
                {units:[1,0,1,0,1,0,0],city:3,region:6,mountainPass:"",otherCountry:"",general:[]},
                {units:[2,0,0,0,0,0,0],city:6,region:11,mountainPass:"",otherCountry:"",general:["娄室"]},
                {units:[0,0,0,0,0,1,0],city:5,region:10,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,0,0,1,0],city:7,region:12,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,0,0,1,0],city:8,region:13,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,0,0,1,0],city:9,region:14,mountainPass:"",otherCountry:"",general:[]},
                {units:[0,0,0,0,0,1,0],city:10,region:15,mountainPass:"",otherCountry:"",general:[]},
                {units:[4,0,0,0,0,0,0],city:11,region:18,mountainPass:"",otherCountry:"",general:[]},
                {units:[2,2,1,0,0,0,0],city:18,region:37,mountainPass:"",otherCountry:"",general:["粘罕"]},
            ],
        },
        firstPlayerID: 0,
        secondPlayerID: 1,
        /*
        对双方隐藏的状态 如事件和计划牌堆
         */
        secret: {
            strategicPlanCardDeck: [1, 2, 3, 4, 5, 6],
            songEventCardDeck: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
            jinnEventCardDeck: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
        },
        otherCountries: {
            '西辽': {state:'song',exist:true,
                regionsForDiplomacy:[2],
                adjacent:['西夏'],
                songLetterCount:0,
                jinnLetterCount:0,
            },
            '西夏': {state:'jinn',exist:true,regionsForDiplomacy:[1,3,9,29,30,31,32],
                adjacent:["西辽",'吐蕃'],songLetterCount:0,
                jinnLetterCount:0,
            },
            '吐蕃': {state:'neutral',exist:true,regionsForDiplomacy:[29,33,51,53,54],
                adjacent:["西夏","大理"],songLetterCount:0,
                jinnLetterCount:0,
            },
            '大理': {state:'song',exist:true,regionsForDiplomacy:[53,57,58],
                adjacent:["吐蕃"],songLetterCount:0,
                jinnLetterCount:0,
            },
            '高丽': {state:'jinn',exist:true,regionsForDiplomacy:[6,23],
                adjacent:[""],songLetterCount:0,
                jinnLetterCount:0,
            }
        },

    };
    initialState.secret.songEventCardDeck = ctx.random.Shuffle(initialState.secret.songEventCardDeck);
    initialState.secret.jinnEventCardDeck = ctx.random.Shuffle(initialState.secret.jinnEventCardDeck);
    initialState.secret.strategicPlanCardDeck = ctx.random.Shuffle(initialState.secret.strategicPlanCardDeck);
    return initialState;
}
