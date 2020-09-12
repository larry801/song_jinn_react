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
    getSongTackleStrength, getJinnTackleDamage, getSongTackleDamage,
} from "./util";
import {getRegionById} from "../constants/regions";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import {canChoosePlan} from "../constants/plan";

export const choosePlayerWhoMovesFirst = {
    move: (G, ctx, firstPlayerID) => {
        G.firstPlayerID = firstPlayerID;
        if (firstPlayerID === '0') {
            G.secondPlayerID = '1';
        } else {
            G.secondPlayerID = '0';
        }
        ctx.events.endPhase();
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
    },
    undoable: false,
    client: false
};

export const chooseOpponent = {
    moves: (G, ctx, opponentID) => {
        G.chosenOpponent = opponentID;
        ctx.events.endPhase()
    },
    undoable: false
};

export const emptyRound = {
    move: (G, ctx) => {
        G.opForRecruitAndMarch = 1;
        ctx.events.setStage('recruitOrMarch');
    },
    undoable: false
};

export const siegeOrAttack = {
    move: (G, ctx, choice) => {
        ctx.events.setStage(choice);
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
        ctx.events.endTurn()
    },
};

export const develop = {
    move: (G, ctx, card) => {
        let hands = curPlayerPrivate(G, ctx).hands;
        if (hands.includes(card)) {
            hands.splice(hands.indexOf(card), 1);
            curPub(G, ctx).developCards.push(card);
            ctx.endTurn()
        } else {
            return INVALID_MOVE;
        }
    },
};
export const useOp = {
    move: (G, ctx, arg) => {
        let card;
        let pid;
        if (ctx.currentPlayer === '0') {
            pid = 0;
            card = getJinnCardById(arg);
        } else {
            pid = 1;
            card = getSongCardById(arg);
        }
        G.opForRecruitAndMarch = card.op;
        let hands = G.player[pid].hands;
        hands.splice(hands.indexOf(arg), 1)
        ctx.events.setStage('recruitOrMarch');
    },
}
export const recruitOrMarch = {
    move: (G, ctx, choice) => {
        if (choice === 'recruit' || choice === 'march') {
            ctx.events.setStage(choice);
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
        ctx.events.setStage('recruitOrMarch');
    } else {
        ctx.events.endTurn();
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
                                    ctx.events.setStage('combatCard')
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
                                ctx.events.setStage('combatCard');
                            }
                        } else {
                            // "直接消灭敌方非军团部队"
                            removeTroop(jinn);
                        }
                    }
                } else {
                    if (song !== false) {
                        mergeTroopTo(G, ctx, arg.src, newTroop);
                        G.pub.song.troops.push(newTroop);
                        if (stackLimitReached(G, ctx, arg, region)) {
                            ctx.events.setStage('overStackLimit')
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
                            ctx.events.setStage('combatCard');
                            // ctx.events.setActivePlayers({
                            //
                            // })
                        } else {
                            removeTroop(G, ctx, song)
                        }
                    } else {
                        mergeTroopTo(G, ctx, arg.src, newTroop);
                        removeTroop(G, ctx, arg.src)
                        G.pub.jinn.troops.push(newTroop);
                        if (stackLimitReached(G, ctx, arg, region)) {
                            // TODO record over limit troop in G
                            combatOrLimitReached = true;
                            ctx.events.setStage('overStackLimit')
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
                                    ctx.events.setStage('combatCard')
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
                                ctx.events.setStage('combatCard');
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
            ctx.events.setStage('combatCard');
        } else {
            if (G.opForRecruitAndMarch > 0) {
                ctx.events.setStage('recruitOrMarch');
            } else {
                // TODO　add dedicated end turn button/move
                ctx.events.endStage();
            }
        }


    },
    undoable: false
};
export const combatCard = {
    move: (G, ctx, cards, player) => {
            if (player === G.songPlayer) {
                G.pub.song.combatCardChosen = true;
                G.player[player].combatCards = cards;
            } else {
                G.pub.jinn.combatCardChosen = true;
                G.player[player].combatCards = cards;
            }
            let hands = G.player[player].hands;
            for (let card of cards) {
                hands.splice(hands.indexOf(card), 1);
            }
            if(G.pub.song.combatCardChosen && G.pub.jinn.combatCardChosen){
                G.combatInfo.stage = "showCombatCard";
            }
            ctx.events.endTurn();
    },
}

export const showPlanCard = {
    undoable:false,
    move:(G,ctx,) => {
        let p = ctx.currentPlayer;
        if (p === G.songPlayer) {
            G.pub.song.currentPlans = G.player[p].planChosen;
        } else {
            G.pub.jinn.currentPlans = G.player[p].planChosen;
        }
        G.player[p].planChosen=[];
    }
}

export const showCombatCard = {
    move: (G, ctx,) => {
        let p = ctx.currentPlayer;
        if (p === G.songPlayer) {
            G.pub.song.combatCardChosen = false;
            G.combatInfo.song.combatCards = G.player[p].combatCards;
        } else {
            G.pub.jinn.combatCardChosen = false;
            G.combatInfo.jinn.combatCards = G.player[p].combatCards;
        }
        G.player[p].combatCards= [];
        if(G.pub.song.combatCardChosen === false && G.pub.jinn.combatCardChosen === false){
            console.log("All chosen.")
            if(G.combatInfo.song.combatCards.includes(37)){
                let dmg = getSongRangeDamage(G,ctx)
                if(dmg>0){
                    G.combatInfo.jinn.pendingDamage = dmg;
                }
            }else {
                let sDmg = getSongRangeDamage(G,ctx)
                if(sDmg>0){
                    G.combatInfo.jinn.pendingDamage = sDmg;
                }
                let jDmg = getJinnRangeDamage(G,ctx);
                if(jDmg>0){
                    G.combatInfo.song.pendingDamage = jDmg;
                }
                if(sDmg===0&&jDmg===0){
                    let sDmg = getSongTackleDamage(G,ctx)
                    if(sDmg>0){
                        G.combatInfo.jinn.pendingDamage = sDmg;
                    }
                    let jDmg = getJinnTackleDamage(G,ctx);
                    if(jDmg>0){
                        G.combatInfo.song.pendingDamage = jDmg;
                    }
                    if(sDmg===0&&jDmg===0){

                    }else {
                        ctx.events.setActivePlayers({
                            all:'takeDamage'
                        });
                    }
                }else{
                    ctx.events.setActivePlayers({
                        all:'takeDamage'
                    });
                }
            }

        }
    },
}

export const moveOpponentArmy = {
    move: (G, ctx, armyID, destination) => {

    },
    undoable: false
};

export const dispatch = {
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

    },
    undoable: false,
}

export function XiJunQuDuan(G, ctx, region) {

}

export function chooseTakeCardTiming(G, ctx, timing) {

}

export function takeCardFromDeck(G, ctx, cardID) {

}
