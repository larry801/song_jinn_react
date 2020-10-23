import {Stage} from "boardgame.io/core";

export function signalEndStage(G, ctx) {
    if (G.logDiscrepancyWorkaround) {
        G.pending.endStage = true;
    } else {
        ctx.events.endStage();
    }
}

export function signalEndActivePlayer(G, ctx, originalStage = false) {
    if (G.logDiscrepancyWorkaround) {
        G.pending.endActivePlayer = true;
    } else {
        if (originalStage) {
            ctx.events.setActivePlayers({current: G.stage})
        } else {
            ctx.events.setActivePlayers({current: Stage.NULL});
        }
    }
}

export function cleanPendingSignal(G, ctx) {
    G.pending = {
        endActivePlayer: false,
        endTurn: false,
        endPhase: false,
        endStage: false,
    }
}

export function signalEndTurn(G, ctx) {
    if (G.logDiscrepancyWorkaround) {
        G.pending.endTurn = true;
    } else {
        ctx.events.endTurn();
    }
}

export function signalEndPhase(G, ctx,) {
    if (G.logDiscrepancyWorkaround) {
        G.pending.endPhase = true;
    } else {
        ctx.events.endPhase();
    }
}

export function changeStage(G, ctx, stage) {
    if (G.logDiscrepancyWorkaround) {
        G.stage = stage;
        if (G.combatInfo.pendingCombat) {
            G.combatInfo.stage = stage;
        }
    } else {
        ctx.events.setStage(stage);
    }
}

export function changeBothStage(G, ctx, stage) {
    if (G.logDiscrepancyWorkaround) {
        G.stage = stage;
        if (G.combatInfo.pendingCombat) {
            G.combatInfo.stage = stage;
        }
        ctx.events.setActivePlayers({
            all: Stage.NULL
        })
    } else {
        ctx.events.setActivePlayers({
            all: stage
        })
    }
}

export function changeSongStage(G, ctx, stage) {
    if (ctx.currentPlayer === G.songPlayer) {
        changeOpponentStage(G, ctx, stage);
    } else {
        changeStage(G, ctx, stage);
    }
}

export function changeJinnStage(G, ctx, stage) {
    if (ctx.currentPlayer === G.jinnPlayer) {
        changeOpponentStage(G, ctx, stage);
    } else {
        changeStage(G, ctx, stage);
    }
}

export function changeOpponentStage(G, ctx, stage) {
    if (G.logDiscrepancyWorkaround) {
        G.stage = stage;
        if (G.combatInfo.pendingCombat) {
            G.combatInfo.stage = stage;
        }
        ctx.events.setActivePlayers({
            others: Stage.NULL
        })
    } else {
        ctx.events.setActivePlayers({
            others: stage
        })
    }

}

export function changePhase(G, ctx, phase) {
    if (G.logDiscrepancyWorkaround) {
        G.phase = phase;
    } else {
        ctx.events.setPhase(phase);
    }
}

export function autoEventsOnMove(G, ctx) {
    if (G.pending.endTurn) {
        ctx.events.endTurn();
    }
    if (G.pending.endPhase) {
        ctx.events.endPhase();
    }
    if (G.pending.endActivePlayer) {
        ctx.events.setActivePlayers({current: Stage.NULL});
    }

}
