import {setupGame} from "./setupGame";
import {
    emptyRound,
    choosePlayerWhoMovesFirst,
    chooseStrategicPlans,
    playAsEvent,
    march,
    recruit,
    recruitOrMarch,
    diplomacy,
    takeCardFromDeck,
    chooseTakeCardTiming,
    useOp,
    siegeOrAttack,
    develop,
    combatCard,
    showCombatCard, showPlanCard, takeDamage
} from "./moves";
import * as util from "./util";
import {PlayerView} from "boardgame.io/dist/esm/core";
import {drawPhaseForSong} from "./util";
import {drawPhaseForJinn} from "./util";

export const SongJinn = {
    name: "Conflict_Song_and_Jin",
    numPlayers: 2,
    setup: setupGame,
    moves: {
        emptyRound: emptyRound,
        playAsEvent: playAsEvent,
        useOp: useOp,
        diplomacy: diplomacy,
        develop: develop,
        recruitOrMarch: recruitOrMarch,
        siegeOrAttack: siegeOrAttack,
        combatCard: combatCard,
        showCombatCard: showCombatCard,
        showPlanCard:showPlanCard,
        takeDamage:takeDamage,
    },
    playerView: PlayerView.STRIP_SECRETS,
    phases: {
        drawEventCard1: {
            // start: true,
            moves: {
                chooseTakeCardTiming: chooseTakeCardTiming,
                takeCardFromDeck: takeCardFromDeck
            },
            onBegin: (G, ctx) => {
                ctx.events.endPhase();
            },
            onEnd: (G, ctx) => {
            },
            next: 'drawEventCard2'
        },
        drawEventCard2: {
            moves: {
                chooseTakeCardTiming: chooseTakeCardTiming,
                takeCardFromDeck: takeCardFromDeck
            },
            onBegin: (G, ctx) => {
                ctx.events.setPhase('chooseOrder');
            },
            onEnd: (G, ctx) => {
            },
            next: 'chooseOrder'
        },
        chooseOrder: {
            start: true,
            onBegin: (G, ctx) => {
                drawPhaseForJinn(G, ctx);
                drawPhaseForSong(G, ctx);
            },
            onEnd: (G, ctx) => {
            },
            moves: {
                choosePlayerWhoMovesFirst: choosePlayerWhoMovesFirst
            },
            turn: {
                order: {
                    first: (G, ctx) => 0,
                    next: (G, ctx) => 0,
                    playOrder: (G, ctx) => [util.findLeadingPlayer(G)]
                },
            },
            next: 'drawPlan'
        },
        drawPlan: {
            moves: {
                chooseStrategicPlans: chooseStrategicPlans,
                showPlanCard:showPlanCard,
            },
            onEnd: (G, ctx) => {

            },
            turn: {
                onBegin: (G, ctx) => {
                    util.drawStrategicPlans(G, ctx, ctx.currentPlayer)
                },
                order: {
                    first: (G, ctx) => 0,
                    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
                    playOrder: (G, ctx) => [G.firstPlayerID, G.secondPlayerID]
                },
            },
            next: 'doOperations'
        },
        doOperations: {

            onEnd: (G, ctx) => G,
            turn: {
                onBegin: (G, ctx) => G,
                onEnd: (G, ctx) => G,
                onMove: (G, ctx) => G,
                moves: {
                    emptyRound: emptyRound,
                    playAsEvent: playAsEvent,
                    useOp: useOp,
                    recruitOrMarch: recruitOrMarch,
                    siegeOrAttack: siegeOrAttack,
                    diplomacy: diplomacy,
                    combatCard: combatCard,

                },
                order: {
                    first: (G, ctx) => 0,
                    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
                    playOrder: (G, ctx) => [G.firstPlayerID, G.secondPlayerID]
                },
                stages: {
                    combatCard:{
                        moves:{
                            combatCard:combatCard,
                            showCombatCard:showCombatCard,
                        }
                    },
                    recruitOrMarch: {
                        moves: {
                            recruitOrMarch: recruitOrMarch
                        }
                    },
                    recruit: {
                        moves: {
                            recruit: recruit
                        }
                    },
                    march: {
                        moves: {
                            march:march
                        }
                    },
                    dispatch: {
                        moves: {}
                    },
                    //征募伪军
                    placeVassalArmy: {}
                }
            },
            next: 'turnEnd',
        },
        settlePlan: {
            next: 'diplomaticOperations'
        },
        diplomaticOperations: {
            next: 'developCountry'
        },
        developCountry: {
            next: 'arrangeSupplementForce'
        },
        arrangeSupplementForce: {
            next: 'turnEnd'
        },
        turnEnd: {
            onBegin: (G, ctx) => {
                if (G.turnMarker === 2) {
                    util.addMidTermCard(G, ctx)
                }
                if (G.turnMarker === 6) {
                    util.addLateTermCards(G, ctx)
                }
                if (G.turnMarker === 8) {
                    ctx.events.setPhase('finalSettlement')
                }
                G.turnMarker = G.turnMarker + 1;
                //TODO 曲端
                ctx.events.endPhase();
            },
            moves: {},
            next: "chooseOrder"
        },
        finalSettlement: {
            onBegin: (G, ctx) => {
            }
        }
    },
    endIf: (G, ctx) => {
        let hasWinner = false;
        let result = {
            winner: null,
            reason: null
        };
        if (hasWinner) {
            return result;
        }
    },
};
