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
    getSongRangeDamage,
    getJinnRangeDamage,
    getJinnMeleeDamage, getSongMeleeDamage, getSongWuLinDamage, canTakeDamage, getSongMeleeOnlyDamage,
} from "./util";
import {getRegionById} from "../constants/regions";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import {canChoosePlan} from "../constants/plan";
import {changeStage, signalEndPhase, signalEndStage, signalEndTurn} from "./workaroundUtil";

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
            G.combatInfo.stage = "combatCard";
            changeStage(G, ctx, "combatCard");
        } else {
            ctx.setActivePlayers({current: "beatGong"})
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
                            // "两军对峙 进军触发会战"
                            combatOrLimitReached = true;
                        } else {
                            // TODO 发展牌救援
                            removeTroop(G, ctx, jinn);
                        }
                    } else {
                        if (troopIsArmy(G, ctx, jinn)) {
                            if (hasCity) {
                                if (songTroopInCity(G, ctx, city)) {
                                    // 解围
                                    G.combatInfo.song.troop = newTroop;
                                    G.combatInfo.song.isAttacker = true;
                                    G.combatInfo.jinn.troop = jinn;
                                    // TODO CUSTOM_FROM('order')
                                    changeStage(G, ctx, 'combatCard')
                                } else {
                                    // 攻城
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
                                combatOrLimitReached = true;
                                G.combatInfo.song.isAttacker = true;
                                G.combatInfo.song.troop = newTroop;
                                G.combatInfo.jinn.troop = jinn;
                                changeStage(G, ctx, 'combatCard');
                            }
                        } else {
                            // "直接消灭敌方非军团部队"
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
                            // "有己方部队"
                        }
                    } else {
                        transfer();
                    }
                }
            } else {
                if (jinn !== false) {
                    if (song !== false) {
                        if (troopIsArmy(G, ctx, song)) {
                            //return "两军对峙 进军触发会战"
                            combatOrLimitReached = true;
                            G.combatInfo.jinn.isAttacker = true;
                            G.combatInfo.jinn.troop = mergeTroopTo(G, ctx, newTroop, jinn);
                            G.combatInfo.song.troop = song;
                            // TODO 会战stage combatCard
                            changeStage(G, ctx, 'combatCard');
                        } else {
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
                    }
                } else {
                    if (song !== false) {
                        if (troopIsArmy(G, ctx, jinn)) {
                            // enemy troop
                            if (hasCity) {
                                if (jinnTroopInCity(G, ctx, city)) {
                                    combatOrLimitReached = true;
                                    G.combatInfo.jinn.isAttacker = true;
                                    G.combatInfo.jinn.troop = newTroop;
                                    G.combatInfo.song.troop = song;
                                    changeStage(G, ctx, 'combatCard')
                                } else {
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
                                combatOrLimitReached = true;
                                G.combatInfo.jinn.isAttacker = true;
                                G.combatInfo.jinn.troop = newTroop;
                                G.combatInfo.song.troop = song;
                                changeStage(G, ctx, 'combatCard');
                            }
                        } else {
                            // "直接消灭敌方非军团部队"
                            removeTroop(G, ctx, song);
                        }
                    } else {
                        transfer();
                    }
                }
            }


        }
        G.opForRecruitAndMarch--;

        if (combatOrLimitReached) {
            G.combatInfo.stage = "combatCard"
            G.combatInfo.pendingCombat = true;
            changeStage(G, ctx, 'combatCard');
        } else {
            if (G.opForRecruitAndMarch > 0) {
                changeStage(G, ctx, 'recruitOrMarch');
            } else {
                // TODO　add dedicated end turn button/move
                signalEndStage(G, ctx);
            }
        }


    },
    undoable: false
};

function rangeStage(G, ctx) {
    let hasDamage = false;
    if (G.combatInfo.song.combatCards.includes(37)) {
        let dmg = getSongRangeDamage(G, ctx)
        G.combatInfo.jinn.pendingDamage = dmg;
        if (dmg > 0) {
            hasDamage = true;
        } else {
            let jDmg = getJinnRangeDamage(G, ctx);
            G.combatInfo.song.pendingDamage = jDmg;
            if (jDmg > 0) {
                hasDamage = true;
            } else {
                if (G.combatInfo.song.troop.general.includes("吴璘")) {
                    wuLinStage(G, ctx);
                }
                meleeStage(G, ctx);
            }
        }
    } else {
        G.combatInfo.stage = "range";
        let sDmg = getSongRangeDamage(G, ctx)
        G.combatInfo.jinn.pendingDamage = sDmg;
        let jDmg = getJinnRangeDamage(G, ctx);
        G.combatInfo.song.pendingDamage = jDmg;
        if (sDmg === 0 && jDmg === 0) {
            if (G.combatInfo.song.troop.general.includes("吴璘")) {
                wuLinStage(G, ctx);
            }
            meleeStage(G, ctx);
        } else {
            hasDamage = true;
        }
    }
    if (hasDamage) {
        ctx.events.setActivePlayers({
            all: 'takeDamage'
        });
        G.combatInfo.stage = "takeDamageRange"
    }
}

function wuLinStage(G, ctx) {
    let dmg = getSongWuLinDamage(G, ctx,);
    if (dmg > 0) {
        G.combatInfo.jinn.pendingDamage = dmg;
        G.combatInfo.stage = "takeDamageWuLin"
    } else {
        meleeStage(G, ctx);
    }
}

function meleeStage(G, ctx) {
    let hasDamage = false;
    if (G.combatInfo.song.combatCards.includes(37)) {
        let dmg = getSongRangeDamage(G, ctx)
        G.combatInfo.jinn.pendingDamage = dmg;
        if (dmg > 0) {
            hasDamage = true;
            G.combatInfo.stage = "takeDamageZhuDuiShiMelee1"
        } else {
            let sDmg = getSongMeleeOnlyDamage(G, ctx,);
            let jDmg = getJinnMeleeDamage(G, ctx);
            G.combatInfo.song.pendingDamage = jDmg;
            if (sDmg === 0 && jDmg === 0) {
                G.combatInfo.jinn.dices = [];
                G.combatInfo.song.dices = [];
                G.combatInfo.stage = "beatGong"
                changeStage(G, ctx, "beatGong")
            } else {
                hasDamage = true;
                G.combatInfo.stage = "takeDamageZhuDuiShiMelee2"
            }
        }
    } else {
        let sDmg = getSongMeleeDamage(G, ctx);
        G.combatInfo.jinn.pendingDamage = sDmg;
        let jDmg = getJinnMeleeDamage(G, ctx);
        G.combatInfo.song.pendingDamage = jDmg;
        if (sDmg === 0 && jDmg === 0) {
            console.log(sDmg, jDmg)
            // G.combatInfo.jinn.dices =[];
            // G.combatInfo.song.dices =[];
            // G.combatInfo.stage = "beatGong"
            // changeStage(G,ctx,"beatGong")
        } else {
            hasDamage = true;
        }
    }
    if (hasDamage) {
        G.combatInfo.stage = "takeDamageMelee"
        ctx.events.setActivePlayers({
            all: 'takeDamage'
        });
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
            G.combatInfo.stage = "showCombatCard";
            if (!G.logDiscrepancyWorkaround) {
                G.song.combatCardChosen = false;
                G.combatInfo.song.combatCards = G.player[G.songPlayer].combatCards;
                G.player[G.songPlayer].combatCards = [];
                G.jinn.combatCardChosen = false;
                G.combatInfo.jinn.combatCards = G.player[G.jinnPlayer].combatCards;
                G.player[G.jinnPlayer].combatCards = [];
                if(G.combatInfo.jinn.combatCards.includes(50)){
                    changeStage(G,ctx,"retreat");
                }else {
                    rangeStage(G, ctx);
                }
            }
        }
        signalEndTurn(G, ctx);
    },
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
            p.planShown=true;
            o = G.song;
        }
        G.player[ctx.currentPlayer ].planChosen = [];
        if (p.planShown && o.planShown) {
            signalEndPhase(G, ctx);
        } else {
            signalEndTurn(G, ctx);
        }
    }
}

export const showCombatCard = {
    move: (G, ctx,) => {
        let p = ctx.currentPlayer;
        if (p === G.songPlayer) {
            G.song.combatCardChosen = false;
            G.combatInfo.song.combatCards = G.player[p].combatCards;
        } else {
            G.jinn.combatCardChosen = false;
            G.combatInfo.jinn.combatCards = G.player[p].combatCards;
        }
        G.player[p].combatCards = [];
        if (G.song.combatCardChosen === false && G.jinn.combatCardChosen === false) {
            rangeStage(G, ctx);
        }
        signalEndTurn(G, ctx);
    },
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
        let pub;
        let combatInfo;
        let opponentInfo;
        if (arg.eliminated.length === 0 && arg.defeated.length === 0) {
            return INVALID_MOVE;
        } else {
            let all = arg.eliminated.concat(arg.defeated)
            if (all[0].owner === 'song') {
                pub = G.song;
                combatInfo = G.combatInfo.song;
                opponentInfo = G.combatInfo.jinn;
            } else {
                pub = G.jinn
                combatInfo = G.combatInfo.jinn;
                opponentInfo = G.combatInfo.song;
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
            if (G.combatInfo.stage === "takeDamageRange") {
                meleeStage(G, ctx);
            }
            if (G.combatInfo.stage === "takeDamageWuLin") {
                meleeStage(G, ctx);
            }
            if (G.combatInfo.stage === "takeDamageMelee") {
                G.combatInfo.jinn.dices = [];
                G.combatInfo.song.dices = [];
                G.combatInfo.stage = "beatGong"
            }
        }
    },
}

export const beatGong = {
    move: (G, ctx, arg) => {
        if (arg.playerID === G.songPlayer) {
            let c = G.combatInfo.song;
            if (c.troop.general.includes("岳飞") && !c.isAttacker && arg.choice === "forceRoundTwo") {
                G.combatInfo.isRoundTwo = true;
                ctx.events.setActivePlayers({all: "combatCard"});
            }
            G.combatInfo.song.beatGongChoice = arg.choice;
        } else {
            let c = G.combatInfo.jinn;
            let o = G.combatInfo.song;
            let canRoundTwo = c.isAttacker && (G.jinn.military > G.song.military || c.troop.general.includes("兀术")) && !G.combatInfo.isRoundTwo
            if (canRoundTwo && arg.choice === "roundTwo") {

            }
        }
    },
}
