export function signalEndStage(G,ctx){
    if (G.logDiscrepancyWorkaround) {
        G.pending.endStage = true;
    } else {
        ctx.events.endStage();
    }
}
export function signalEndTurn(G,ctx){
    if (G.logDiscrepancyWorkaround) {
        G.pending.endTurn = true;
    } else {
        ctx.events.endTurn();
    }
}
export function signalEndPhase(G,ctx,){
    if (G.logDiscrepancyWorkaround) {
        G.pending.endPhase = true;
    } else {
        ctx.events.endPhase();
    }
}
export function changeStage(G,ctx,stage){
    if (G.logDiscrepancyWorkaround) {
        G.stage = stage;
    } else {
        ctx.events.setStage(stage);
    }
}

export function changePhase(G,ctx,phase){
    if (G.logDiscrepancyWorkaround) {
        G.phase = phase;
    } else {
        ctx.events.setPhase(phase);
    }
}
