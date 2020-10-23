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
    showCombatCard, showPlanCard, takeDamage, resultOfDevelopment, beatGong, dispatchGeneral, reinforcement
} from "./moves";
import * as util from "./util";
import {PlayerView} from "boardgame.io/dist/esm/core";
import {drawPhaseForSong} from "./util";
import {drawPhaseForJinn} from "./util";
import {autoEventsOnMove, changePhase, cleanPendingSignal, signalEndPhase} from "./workaroundUtil";

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
        siegeOrAttack: siegeOrAttack,
        combatCard: combatCard,
        resultOfDevelopment: resultOfDevelopment,
        showCombatCard: showCombatCard,
        showPlanCard: showPlanCard,
        takeDamage: takeDamage,
        beatGong: beatGong,

        march: march,
        recruitOrMarch: recruitOrMarch,
        recruit: recruit,
        reinforcement: reinforcement,
    },
    playerView: PlayerView.STRIP_SECRETS,
    phases: {
        drawEventCard1: {
            moves: {
                chooseTakeCardTiming: chooseTakeCardTiming,
                takeCardFromDeck: takeCardFromDeck
            },
            onBegin: (G, ctx) => {
                cleanPendingSignal(G, ctx);
                signalEndPhase(G, ctx);
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
                cleanPendingSignal(G, ctx);
                changePhase(G, ctx, 'chooseOrder');
            },
            onEnd: (G, ctx) => {
            },
            next: 'chooseOrder'
        },
        chooseOrder: {
            // start: true,
            onBegin: (G, ctx) => {
                // drawPhaseForJinn(G, ctx);
                // drawPhaseForSong(G, ctx);
                cleanPendingSignal(G, ctx);
            },
            onEnd: (G, ctx) => {
                cleanPendingSignal(G, ctx);
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
                showPlanCard: showPlanCard,
            },
            turn: {
                onBegin: (G, ctx) => {
                    cleanPendingSignal(G, ctx);
                    if (!G.song.planChosen || !G.jinn.planChosen) {
                        util.drawStrategicPlans(G, ctx, ctx.currentPlayer);
                    }
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
            start: true,
            onBegin: (G, ctx) => {
                drawPhaseForJinn(G, ctx);
                drawPhaseForSong(G, ctx);
                G.song.planChosen = false;
                G.jinn.planChosen = false;
                G.song.planShown = false;
                G.jinn.planShown = false;
                cleanPendingSignal(G, ctx);
            },
            turn: {
                onBegin: (G, ctx) => {
                    cleanPendingSignal(G, ctx);
                },
                onMove: (G, ctx) => {
                    autoEventsOnMove(G, ctx);
                },
                order: {
                    first: (G, ctx) => 0,
                    next: (G, ctx) => (ctx.playOrderPos + 1) % ctx.numPlayers,
                    playOrder: (G, ctx) => [G.firstPlayerID, G.secondPlayerID]
                },
                stages: {
                    combatCard: {
                        moves: {
                            combatCard: combatCard,
                            showCombatCard: showCombatCard,
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
                            march: march
                        }
                    },
                    dispatchGeneral: {
                        moves: {
                            dispatchGeneral: dispatchGeneral
                        }
                    },
                }
            },
            next: 'settlePlan',
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
                cleanPendingSignal(G, ctx);
                if (G.turnMarker === 2) {
                    util.addMidTermCard(G, ctx)
                }
                if (G.turnMarker === 6) {
                    util.addLateTermCards(G, ctx)
                }
                if (G.turnMarker === 8) {
                    changePhase(G, ctx, 'finalSettlement')
                }
                G.turnMarker = G.turnMarker + 1;
                //TODO 曲端
                signalEndPhase(G, ctx);
            },
            moves: {},
            next: "chooseOrder"
        },
        finalSettlement: {
            onBegin: (G, ctx) => {
                cleanPendingSignal(G, ctx);

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
