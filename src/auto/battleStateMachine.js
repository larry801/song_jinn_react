import {changeStage} from "./workaroundUtil";

export function retreat(G,ctx){
    changeStage(G,ctx,"retreat")
}
export function cleanUp(G,ctx,){
    for(let card of G.combatInfo.jinn.combatCards ) G.jinn.discard.push(card);
    G.combatInfo.jinn.combatCards =[];
    for(let card of G.combatInfo.song.combatCards ) G.song.discard.push(card);
    G.combatInfo.song.combatCards = [];
    G.combatInfo.pendingCombat = false;
    G.combatInfo.stage = "noCombat";
}

export function stationedArcherRangeFirst(G,ctx){

}
export function stationedArcherRangeNormal(G,ctx){

}
export function stationedArcherMeleeFirst(G,ctx){

}
export function stationedArcherMeleeNormal(G,ctx){

}
export function rangeDice(G, ctx,) {

}
export function atkBeatGong(G,ctx){

}
export function defBeatGong(G,ctx){

}
