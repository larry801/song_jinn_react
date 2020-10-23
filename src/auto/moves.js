import {INVALID_MOVE} from 'boardgame.io/core'
import {
    canRecruit,
    getRecruitTotalCost,
    getStateById,
    getCurrentPlayerID,
    curPub,
    curPlayerPrivate,
    jinnTroopInRegion,
    songTroopInRegion,
    troopIsArmy,
    stackLimitReached,
    songTroopInCity,
    mergeTroopTo,
    removeTroop,
    jinnTroopInCity,
    splitTroopFrom,
    canTakeDamage,
} from "./util";
import {getRegionById} from "../constants/regions";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import {canChoosePlan} from "../constants/plan";
import {
    changeBothStage, changeJinnStage, changeSongStage,
    changeStage,
    signalEndActivePlayer,
    signalEndPhase,
    signalEndStage,
    signalEndTurn
} from "./workaroundUtil";
import {getCityByID} from "../constants/cities";
import {
    atkBeatGong, atkRetreat, canForceRoundTwo, confrontation, defBeatGong, defRetreat, doRoundTwo,
    endMeleeStage,
    endRangeStage,
    meleeStage,
    settleCombatCard,
    startCombat,
    stationedArcherRangeNormal
} from "./battleStateMachine";

export const choosePlayerWhoMovesFirst = {
    move: (G, ctx, firstPlayerID) => {
        G.firstPlayerID = firstPlayerID;
        if (firstPlayerID === '0') {
            G.playerOrder = ['0', '1']
            G.secondPlayerID = '1';
        } else {
            G.playerOrder = ['1', '0']
            G.secondPlayerID = '0';
        }
        G.orderChosen = true;
        signalEndPhase(G, ctx);
    },
    undoable: false
};

export const chooseStrategicPlans = {
    move: (G, ctx, plans) => {
        let player = ctx.currentPlayer;
        let state = G.player[player];
        let pub = curPub(G, ctx);
        let limit = pub.lastTurnPlans.includes(21) ? 2 : 1;
        if (plans.length === 0 && state.availablePlans.filter(p => canChoosePlan(G, ctx, p, player)).length > 0) {
            return INVALID_MOVE;
        }
        if (limit < plans.length) {
            return INVALID_MOVE;
        }
        for (let plan of plans) {
            if (state.availablePlans.includes(plan) && canChoosePlan(G, ctx, plan, player)) {
                state.availablePlans.splice(state.availablePlans.indexOf(plan), 1)
                state.chosenPlans.push(plan);
            } else {
                return INVALID_MOVE;
            }
        }
        for (let planCard of state.availablePlans) {
            G.secret.strategicPlanCardDeck.push(planCard);
        }
        G.secret.strategicPlanCardDeck = ctx.random.Shuffle(G.secret.strategicPlanCardDeck);
        pub.planChosen = true;
        signalEndTurn(G, ctx);
    },
    undoable: false,
    client: false
};

export const chooseOpponent = {
    moves: (G, ctx, opponentID) => {
        G.chosenOpponent = opponentID;
        signalEndPhase(G, ctx);
    },
    undoable: false
};

export const emptyRound = {
    move: (G, ctx) => {
        G.opForRecruitAndMarch = 1;
        if (G.logDiscrepancyWorkaround) {
            G.stage = 'recruitOrMarch';
        } else {
            changeStage(G, ctx, 'recruitOrMarch');
        }
    },
    undoable: false
};

export const siegeOrAttack = {
    move: (G, ctx, choice) => {
        changeStage(G, ctx, choice);
    },
    undoable: false,
}

export const playAsEvent = {
    move: (G, ctx, cardID) => {
        let state = curPub(G, ctx);
        let privateState = G.player[getCurrentPlayerID(ctx)];
        let hand = privateState.hands;
        if (hand.includes(cardID)) {
            let index = hand.indexOf(cardID);
            hand.splice(index, 1);
            state.discard.push(cardID);
        } else {
            return INVALID_MOVE
        }
    },
    undoable: false
};

export const NewEmperor = {
    move: (G, ctx, city) => {
        G.song.emperor.exist = true;
        G.song.emperor.region = city;
    },
    undoable: false
}

export const diplomacy = {
    move: (G, ctx, arg) => {
        let card = curPlayerPrivate(G, ctx).hands.splice(arg.card, 1);
        curPlayerPrivate(G, ctx).letterOfCredenceDetail[arg.target].push(card);
        let id = ctx.currentPlayer;
        if (id === G.songPlayer) {
            G.otherCountries[arg.target].songLetterCount++;
        } else {
            G.otherCountries[arg.target].jinnLetterCount++;
        }
        signalEndTurn(G, ctx);
    },
};

export const develop = {
    move: (G, ctx, card) => {
        let hands = curPlayerPrivate(G, ctx).hands;
        if (hands.includes(card)) {
            hands.splice(hands.indexOf(card), 1);
            curPub(G, ctx).developCards.push(card);
            signalEndTurn(G, ctx);
        } else {
            return INVALID_MOVE;
        }
    },
};
export const useOp = {
    move: (G, ctx, arg) => {
        let card;
        if (G.jinnPlayer === ctx.currentPlayer) {
            card = getJinnCardById(arg);
        } else {
            card = getSongCardById(arg);
        }
        G.opForRecruitAndMarch = card.op;
        let hands = G.player[ctx.currentPlayer].hands;
        hands.splice(hands.indexOf(arg), 1)
        changeStage(G, ctx, 'recruitOrMarch');
    },
}

export const forceRoundTwo = {
    move: (G, ctx, arg) => {
        if (arg === "yes") {
            doRoundTwo(G, ctx);
        } else {
            atkBeatGong(G, ctx);
        }

    }
}

export const placeTroop = {
    move: (G, ctx) => {

    }
}

export const recruitOrMarch = {
    move: (G, ctx, choice) => {
        if (choice === 'recruit' || choice === 'march' || choice === 'recruitVassal') {
            changeStage(G, ctx, choice);
        } else {
            return INVALID_MOVE
        }
    },
};
const recruitFunction = (G, ctx, units, ignoreCivilTechLevel = false) => {
    let state = getStateById(G, ctx, ctx.currentPlayer);
    let bank = state.reserveBank;
    let supplement = state.supplementBank;
    if (canRecruit(G, ctx, units)) {
        for (let i = 0; i < units.length; i++) {
            supplement[i] = Math.min(bank[i], units[i]) + supplement[i];
        }
        let totalCost = getRecruitTotalCost(G, ctx, units);
        G.opForRecruitAndMarch = G.opForRecruitAndMarch - totalCost;
    } else {
        return INVALID_MOVE
    }

    if (G.opForRecruitAndMarch > 0) {
        changeStage(G, ctx, 'recruitOrMarch');
    } else {
        signalEndTurn(G, ctx);
    }
};
export const recruitIgnoreCivilTechLevel = {
    move: (G, ctx, units) => {
        return recruitFunction(G, ctx, units, true);
    },
    undoable: false
};
export const recruit = {
    move: (G, ctx, units) => {
        return recruitFunction(G, ctx, units);
    },
    undoable: false
};
export const march = {
    move: (G, ctx, arg) => {
        function transfer() {
            arg.src.region = arg.dst;
            let region = getRegionById(arg.dst);
            arg.src.city = region.city;
        }

        let playerID;
        // TODO　ＳａｎＮｉａｎＺｈｉＹｕｅ
        // TODO TuWei or Attach on original region
        if (arg.src.units.length === 7) {
            playerID = G.jinnPlayer;
        } else {
            playerID = G.songPlayer;
        }
        let newTroop;
        let combatOrLimitReached = false;
        if (arg.all) {
            arg.src.reigon = arg.dst;
            newTroop = arg.src;
        } else {
            splitTroopFrom(arg.src, arg.new)
            newTroop = arg.new
        }
        let region = arg.dst;
        let hasCity = getRegionById(region).hasCity;
        let city = getRegionById(region).cityID;
        if (region === 0) {
            return INVALID_MOVE;
        } else {
            let jinn = jinnTroopInRegion(G, ctx, region);
            let song = songTroopInRegion(G, ctx, region);
            if (playerID === G.songPlayer) {
                if (jinn !== false) {
                    if (song !== false) {
                        if (troopIsArmy(G, ctx, jinn)) {
                            G.combatInfo.song.isAttacker = true;
                            G.combatInfo.song.troop = mergeTroopTo(G, ctx, newTroop, song);
                            G.combatInfo.jinn.troop = jinn;
                            console.log("两军对峙 进军触发会战");
                            combatOrLimitReached = true;
                        } else {
                            console.log(" 发展牌救援");
                            // TODO 发展牌救援
                            removeTroop(G, ctx, jinn);
                        }
                    } else {
                        if (troopIsArmy(G, ctx, jinn)) {
                            if (hasCity) {
                                if (songTroopInCity(G, ctx, city)) {
                                    console.log("解围");
                                    G.combatInfo.song.troop = newTroop;
                                    G.combatInfo.song.isAttacker = true;
                                    G.combatInfo.jinn.troop = jinn;
                                    // TODO CUSTOM_FROM('order')
                                    changeStage(G, ctx, 'combatCard')
                                } else {
                                    console.log("攻城");
                                    combatOrLimitReached = true;
                                    G.combatInfo.song.troop = newTroop;
                                    G.combatInfo.song.isAttacker = true;
                                    G.combatInfo.jinn.troop = jinn;
                                    if (G.jinnPlayer === '0') {
                                        ctx.events.setActivePlayers({'0': {stage: 'fieldOrCity', moveLimit: 1}})
                                    } else {
                                        ctx.events.setActivePlayers({'1': {stage: 'fieldOrCity', moveLimit: 1}})
                                    }
                                }
                            } else {
                                startCombat(G, ctx, {
                                    type: "field",
                                    attacker: "song",
                                    songTroop: newTroop,
                                    jinnTroop: jinn,
                                })

                                console.log("野战");

                                newTroop.region = region;
                                newTroop.city = 0;
                                combatOrLimitReached = true;
                            }
                        } else {
                            // ""
                            console.log("直接消灭敌方非军团部队");

                            removeTroop(jinn);
                        }
                    }
                } else {
                    if (song !== false) {
                        mergeTroopTo(G, ctx, arg.src, newTroop);
                        G.song.troops.push(newTroop);
                        if (stackLimitReached(G, ctx, arg, region)) {
                            changeStage(G, ctx, 'overStackLimit')
                        } else {
                            //
                            console.log("\"有己方部队\"");

                        }
                    } else {
                        console.log("转移");

                        transfer();
                    }
                }
            } else {
                if (jinn !== false) {
                    if (song !== false) {
                        if (troopIsArmy(G, ctx, song)) {
                            //return "两军对峙 进军触发会战"
                            console.log("Hui zhan")
                            combatOrLimitReached = true;
                            G.combatInfo.jinn.isAttacker = true;
                            G.combatInfo.jinn.troop = mergeTroopTo(G, ctx, newTroop, jinn);
                            G.combatInfo.song.troop = song;
                            // TODO 会战stage combatCard
                            changeStage(G, ctx, 'combatCard');
                        } else {
                            console.log("rescue")
                            removeTroop(G, ctx, song)
                        }
                    } else {
                        mergeTroopTo(G, ctx, arg.src, newTroop);
                        removeTroop(G, ctx, arg.src)
                        G.jinn.troops.push(newTroop);
                        if (stackLimitReached(G, ctx, arg, region)) {
                            // TODO record over limit troop in G
                            combatOrLimitReached = true;
                            changeStage(G, ctx, 'overStackLimit')
                        }
                        console.log("jiuyuan")
                    }
                } else {
                    if (song !== false) {
                        if (troopIsArmy(G, ctx, jinn)) {
                            // enemy troop
                            console.log("enemy troop")
                            if (hasCity) {
                                if (jinnTroopInCity(G, ctx, city)) {
                                    console.log("jie wei");

                                    combatOrLimitReached = true;
                                    G.combatInfo.jinn.isAttacker = true;
                                    G.combatInfo.jinn.troop = newTroop;
                                    G.combatInfo.song.troop = song;
                                    changeStage(G, ctx, 'combatCard')
                                } else {
                                    console.log("gongcheng")
                                    combatOrLimitReached = true;
                                    G.combatInfo.jinn.isAttacker = true;
                                    G.combatInfo.isSiege = true;
                                    G.combatInfo.jinn.troop = newTroop;
                                    G.combatInfo.song.troop = song;
                                    if (G.songPlayer === '0') {
                                        ctx.events.setActivePlayers({'0': {stage: 'fieldOrCity', moveLimit: 1}})
                                    } else {
                                        ctx.events.setActivePlayers({'1': {stage: 'fieldOrCity', moveLimit: 1}})
                                    }
                                }
                            } else {
                                // field operation
                                console.log("field operation")
                                combatOrLimitReached = true;
                                G.combatInfo.jinn.isAttacker = true;
                                G.combatInfo.jinn.troop = newTroop;
                                G.combatInfo.song.troop = song;
                                G.combatInfo.isField = true;
                                changeStage(G, ctx, 'combatCard');
                            }
                        } else {
                            console.log("直接消灭敌方非军团部队")
                            removeTroop(G, ctx, song);
                        }
                    } else {
                        console.log("transfer")
                        transfer();
                    }
                }
            }


        }
        G.opForRecruitAndMarch--;
        if (!combatOrLimitReached) {
            if (G.opForRecruitAndMarch > 0) {
                changeStage(G, ctx, 'recruitOrMarch');
            } else {
                // TODO　add dedicated end turn button/move
                signalEndStage(G, ctx);
            }
        }


    },
    undoable: false,
    client: false,
};

export const reinforcement = {
    move: (G, ctx, arg) => {
        let t, o, troops;
        if (ctx.currentPlayer === G.songPlayer) {
            t = songTroopInCity;
            o = jinnTroopInRegion;
            troops = G.song.troops;
        } else {
            t = jinnTroopInCity;
            o = songTroopInRegion;
            troops = G.jinn.troops;
        }

        for (let r in arg) {
            let troop = t(G, ctx, r.id);
            if (troop === false) {
                let region = getCityByID(r.id).region;
                let opponentTroop = o(G, ctx, region);
                if (opponentTroop === false) {
                    troop.region = region;
                }
                troops.push(troop);
            } else {
                mergeTroopTo(G, ctx, r.troop, troop)
            }
        }
    }
}

export const combatCard = {
    move: (G, ctx, cards, player) => {
        if (player === G.songPlayer) {
            G.song.combatCardChosen = true;
            G.player[player].combatCards = cards;
        } else {
            G.jinn.combatCardChosen = true;
            G.player[player].combatCards = cards;
        }
        let hands = G.player[player].hands;
        for (let card of cards) {
            hands.splice(hands.indexOf(card), 1);
        }

        if (G.song.combatCardChosen && G.jinn.combatCardChosen) {
            if (G.player[G.songPlayer].combatCards.length === 0 && G.player[G.jinnPlayer].combatCards.length === 0) {
                settleCombatCard(G, ctx);
            } else {
                if (G.logDiscrepancyWorkaround) {
                    changeBothStage(G, ctx, "showCombatCard");
                } else {
                    let i = G.combatInfo;
                    G.song.combatCardChosen = false;
                    i.song.combatCards = G.player[G.songPlayer].combatCards;
                    G.player[G.songPlayer].combatCards = [];
                    G.jinn.combatCardChosen = false;
                    i.jinn.combatCards = G.player[G.jinnPlayer].combatCards;
                    G.player[G.jinnPlayer].combatCards = [];
                    settleCombatCard(G, ctx);
                }
            }
        }else {
            if(G.song.combatCardChosen){
                changeJinnStage(G,ctx,"combatCard");
            }else {
                changeSongStage(G,ctx,"combatCard");
            }
        }
        if (ctx.currentPlayer !== player) {
            signalEndActivePlayer(G, ctx);
        }
    },
    client: false,
    redux: true,
}

export const showPlanCard = {
    undoable: false,
    move: (G, ctx, cards) => {
        let p, o;
        if (ctx.currentPlayer === G.songPlayer) {
            p = G.song;
            p.currentPlans = cards;
            p.planShown = true;
            o = G.jinn;

        } else {
            p = G.jinn;
            p.currentPlans = cards;
            p.planShown = true;
            o = G.song;
        }
        G.player[ctx.currentPlayer].planChosen = [];
        if (p.planShown && o.planShown) {
            signalEndPhase(G, ctx);
        } else {
            signalEndTurn(G, ctx);
        }
    }
}

export const showCombatCard = {
    move: (G, ctx, arg) => {
        let opponentID;
        if (arg.playerID === G.songPlayer) {
            G.song.combatCardChosen = false;
            G.combatInfo.song.combatCards = arg.cards;
            opponentID = G.jinnPlayer;
        } else {
            G.jinn.combatCardChosen = false;
            G.combatInfo.jinn.combatCards = arg.cards;
            opponentID = G.songPlayer;
        }
        G.player[arg.playerID].combatCards = [];
        if (G.player[opponentID].combatCards.length === 0) {
            settleCombatCard(G, ctx);
        } else {
            if (G.song.combatCardChosen === false && G.jinn.combatCardChosen === false) {
                settleCombatCard(G, ctx);
            } else {
                if (ctx.currentPlayer !== arg.playerID) {
                    signalEndActivePlayer(G, ctx);
                }
            }
        }
    },
    client: false,
}

export const moveOpponentArmy = {
    move: (G, ctx, armyID, destination) => {

    },
    undoable: false
};

export const dispatchGeneral = {
    move: (G, ctx, arg) => {

    },
    undoable: false
};

export const cedingTerritory = {
    move: (G, ctx) => {

    },
    undoable: false
};
export const directRecruit = {
    move: (G, ctx) => {
    },
    undoable: false
};

export const resultOfDevelopment = {
    move: (G, ctx, arg) => {
        if (arg.playerID === G.songPlayer) {
            G.song.military = arg.military;
            G.song.civil = arg.civil;
            G.song.policy = arg.special;
        } else {
            G.jinn.military = arg.military;
            G.jinn.civil = arg.civil;
            G.jinn.colonization = arg.special;
        }
    },
    undoable: false,
}

export function XiJunQuDuan(G, ctx, region) {

}

export function chooseTakeCardTiming(G, ctx, timing) {

}

export function takeCardFromDeck(G, ctx, cardID) {

}

export const takeDamage = {
    move: (G, ctx, arg) => {
        if (!canTakeDamage(G, ctx, arg)) return INVALID_MOVE;
        let i = G.combatInfo;
        let pub;
        let combatInfo;
        let opponentInfo;
        if (arg.eliminated.length === 0 && arg.defeated.length === 0) {
            return INVALID_MOVE;
        } else {
            let all = arg.eliminated.concat(arg.defeated)
            if (all[0].owner === 'song') {
                pub = G.song;
                combatInfo = i.song;
                opponentInfo = i.jinn;
            } else {
                pub = G.jinn
                combatInfo = i.jinn;
                opponentInfo = i.song;
            }
        }
        arg.eliminated.forEach((i, idx, arr) => {
            combatInfo.troop.units[i.type]--;
            pub.reserveBank[i.type]++;
        })
        arg.defeated.forEach((i, idx, arr) => {
            combatInfo.troop.units[i.type]--;
            pub.supplementBank[i.type]++;
        })
        combatInfo.pendingDamage = 0;
        if (opponentInfo.pendingDamage === 0) {
            if (i.stage === "takeDamageRange") {
                endRangeStage(G, ctx);
            }
            if (i.stage === "takeDamageWuLin") {
                meleeStage(G, ctx);
            }
            if (i.stage === "takeDamageMelee") {
                endMeleeStage(G, ctx);
            }
            if (i.stage === "takeDamageStationedArcherRangeFirst") {
                stationedArcherRangeNormal(G, ctx);
            }
            if (i.stage === "takeDamageStationedArcherMeleeFirst") {
                stationedArcherRangeNormal(G, ctx);
            }
        }
    },
}

export const retreat = {
    move:(G,ctx,arg)=>{
        let i = G.combatInfo;
        if(arg.playerID===G.songPlayer){
            i.song.troop.units[arg.choice]--;
            G.song.supplementBank[arg.choice]++;
        }else{
            i.jinn.troop.units[arg.choice]--;
            G.jinn.supplementBank[arg.choice]++;
    }

    }
}

export const beatGong = {
    move: (G, ctx, arg) => {
        let i = G.combatInfo;
        let atk, def;

        if (arg.playerID === G.songPlayer) {
            let c = i.song;
            i.song.beatGongChoice = arg.choice;
        } else {
            let c = i.jinn;
            c.beatGongChoice = arg.choice;
            let o = i.song;
            let canRoundTwo = c.isAttacker && (G.jinn.military > G.song.military || c.troop.general.includes("兀术")) && !i.isRoundTwo
            if (canRoundTwo && arg.choice === "continue") {

            }
        }
        if (i.song.isAttacker) {
            atk = i.song.beatGongChoice;
            def = i.jinn.beatGongChoice;
        } else {
            atk = i.jinn.beatGongChoice;
            def = i.song.beatGongChoice;
        }
        if (atk === "retreat") {
            atkRetreat(G, ctx);
        } else {
            if (def === "") {
                defBeatGong(G, ctx);
            }else{
                if(def === "retreat"){
                    defRetreat(G,ctx);
                }
                if(atk==="hold" && def==="hold"){
                    confrontation(G,ctx);
                }
                if(atk==="continue" && def==="hold"){
                    doRoundTwo(G,ctx);
                }

            }
        }
    },
}
