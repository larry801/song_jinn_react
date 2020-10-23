import {changeBothStage, changeJinnStage, changeSongStage, changeStage} from "./workaroundUtil";
import {
    getJinnMeleeDamage,
    getJinnRangeDamage, getSongMeleeDamage,
    getSongMeleeOnlyDamage,
    getSongRangeDamage,
    getSongWuLinDamage
} from "./util";
import {initCombatInfo} from "./setupGame";

export function retreat(G, ctx) {
    changeStage(G, ctx, "retreat")
}

function setCombatType(G, ctx, type) {
    let i = G.combatInfo;

    switch (type) {
        case "field":
            i.isField = true;
            break;

        case "siege":
            i.isSiege = true;
            break;

        case "rescue":
            i.isRescue = true;
            break;

        case "breakthrough":
            i.isBreakthrough = true;
            break;
        default:
            throw new Error("Invalid combat type");
    }
    i.type = type;
}

export function startCombat(G, ctx, arg) {
    let i = G.combatInfo;
    if (arg.attacker === "song") {
        i.song.isAttacker = true;
    } else {
        i.jinn.isAttacker = true;
    }
    i.song.troop = arg.songTroop;
    i.jinn.troop = arg.jinnTroop;
    setCombatType(G, ctx, arg.type);
    console.log(JSON.stringify(arg));
    G.combatInfo.pendingCombat = true;
    if (G.songPlayer === G.playerOrder[0]) {
        changeSongStage(G, ctx, 'combatCard');
    }else {
        changeJinnStage(G, ctx, 'combatCard');
    }
}

export function checkStationedArcher(G, ctx) {
    let i = G.combatInfo;
    let songUnits = i.song.troop.units.length;
    let jinnUnits = i.jinn.troop.units.length;
    return i.song.combatCards.includes(37) ||
        (i.song.troop.general.includes("吴玠") && songUnits < jinnUnits)

}

export function settleCombatCard(G, ctx) {
    let i = G.combatInfo;
    G.song.combatCardChosen = false;
    G.jinn.combatCardChosen = false;
    if (i.jinn.combatCards.includes(50)) {
        changeStage(G, ctx, "retreat");
    } else {
        if (checkStationedArcher(G, ctx)) {
            stationedArcherRangeFirst(G, ctx)
        } else {
            rangeStage(G, ctx)
        }
    }
}


export function cleanUp(G, ctx,) {
    let i = G.combatInfo;
    for (let card of i.jinn.combatCards) G.jinn.discard.push(card);
    for (let card of i.song.combatCards) G.song.discard.push(card);
    G.combatInfo = initCombatInfo();
}

export function endRangeStage(G, ctx) {
    let i = G.combatInfo;
    if (i.song.troop.general.includes("吴璘")) {
        wuLinStage(G, ctx);
    } else {
        meleeStage(G, ctx);
    }
}

export function stationedArcherRangeFirst(G, ctx) {
    let i = G.combatInfo;
    let dmg = getSongRangeDamage(G, ctx)
    if (dmg > 0) {
        i.jinn.pendingDamage = dmg;
        changeJinnStage(G, ctx, "takeDamageStationedArcherRangeFirst");
    } else {
        stationedArcherRangeNormal(G, ctx);
    }

}

export function stationedArcherRangeNormal(G, ctx) {
    let i = G.combatInfo;
    let jDmg = getJinnRangeDamage(G, ctx);
    if (jDmg > 0) {
        i.song.pendingDamage = jDmg;
        changeSongStage(G, ctx, "takeDamageRange")
    } else {
        endRangeStage(G, ctx);
    }
}

export function stationedArcherMeleeFirst(G, ctx) {
    let i = G.combatInfo;
    let dmg = getSongRangeDamage(G, ctx)
    if (dmg > 0) {
        i.jinn.pendingDamage = dmg;
        changeJinnStage(G, ctx, "takeDamageStationedArcherMeleeFirst");
    } else {
        stationedArcherMeleeNormal(G, ctx);
    }
}

export function stationedArcherMeleeNormal(G, ctx) {
    let i = G.combatInfo;
    let jDmg = getJinnMeleeDamage(G, ctx);
    let sDmg = getSongMeleeOnlyDamage(G, ctx);

    if (jDmg === 0 && sDmg === 0) {
        endMeleeStage(G, ctx);
    }
    if (jDmg > 0 && sDmg === 0) {
        i.song.pendingDamage = jDmg;
        changeSongStage(G, ctx, "takeDamageRange")
    }
    if (jDmg === 0 && sDmg > 0) {
        i.jinn.pendingDamage = sDmg;
        changeJinnStage(G, ctx, "takeDamageRange")
    }
    if (jDmg > 0 && sDmg > 0) {
        i.song.pendingDamage = jDmg;
        i.jinn.pendingDamage = sDmg;
        changeBothStage(G, ctx, "takeDamageRange");
    }
}

export function endMeleeStage(G, ctx) {
    if (canForceRoundTwo(G, ctx)) {
        changeSongStage(G, ctx, "forceRoundTwo");
    } else {
        atkBeatGong(G, ctx);
    }
}

export function canForceRoundTwo(G, ctx) {
    let i = G.combatInfo;
    return (i.song.troop.general.includes("岳飞") || i.song.combatCards.includes(36)) && !i.isRoundTwo;
}

export function doRoundTwo(G, ctx) {
    let i = G.combatInfo;
    i.isRoundTwo = true;
    changeBothStage(G, ctx, "combatCard");
}

export function rangeStage(G, ctx,) {
    let i = G.combatInfo;
    let sDmg = getSongRangeDamage(G, ctx)
    let jDmg = getJinnRangeDamage(G, ctx);
    if (sDmg === 0 && jDmg === 0) {
        endRangeStage(G, ctx);
    } else {
        if (sDmg === 0) {
            i.song.pendingDamage = jDmg;
            changeSongStage(G, ctx, "takeDamageRange");
        } else {
            if (jDmg === 0) {
                i.jinn.pendingDamage = sDmg;
                changeJinnStage(G, ctx, "takeDamageRange");
            } else {
                i.song.pendingDamage = jDmg;
                i.jinn.pendingDamage = sDmg;
                changeBothStage(G, ctx, "takeDamageRange");
            }
        }
    }
}


export function beatGone(G, ctx) {

}

function wuLinStage(G, ctx) {
    let dmg = getSongWuLinDamage(G, ctx,);
    if (dmg > 0) {
        G.combatInfo.jinn.pendingDamage = dmg;
        changeJinnStage(G, ctx, "takeDamageWuLin");
    } else {
        meleeStage(G, ctx);
    }
}

export function meleeStage(G, ctx) {
    if (checkStationedArcher(G, ctx)) {
        stationedArcherMeleeFirst(G, ctx);
    } else {
        let i = G.combatInfo;
        let sDmg = getSongMeleeDamage(G, ctx);
        let jDmg = getJinnMeleeDamage(G, ctx);
        if (sDmg === 0 && jDmg === 0) {
            endMeleeStage(G, ctx);
        } else {
            if (sDmg === 0) {
                i.song.pendingDamage = jDmg;
                changeSongStage(G, ctx, "takeDamageMelee");
            } else {
                if (jDmg === 0) {
                    i.jinn.pendingDamage = sDmg;
                    changeJinnStage(G, ctx, "takeDamageMelee");
                } else {
                    i.song.pendingDamage = jDmg;
                    i.jinn.pendingDamage = sDmg;
                    changeBothStage(G, ctx, "takeDamageMelee");
                }
            }
        }
    }

}

export function atkBeatGong(G, ctx) {
    let i = G.combatInfo;
    if (i.song.isAttacker) {
        changeSongStage(G, ctx, "beatGong");
    } else {
        changeJinnStage(G, ctx, "beatGong");
    }
}

export function atkRetreat(G, ctx) {
    let i = G.combatInfo;
    if (i.song.isAttacker) {
        changeSongStage(G, ctx, "retreat");
    } else {
        changeJinnStage(G, ctx, "retreat");
    }
}

export function defRetreat(G, ctx) {
    let i = G.combatInfo;
    if (i.jinn.isAttacker) {
        changeSongStage(G, ctx, "retreat");
    } else {
        changeJinnStage(G, ctx, "retreat");
    }
}

export function confrontation(G, ctx) {
    cleanUp(G, ctx);
}

export function defBeatGong(G, ctx) {
    let i = G.combatInfo;
    if (i.jinn.isAttacker) {
        changeSongStage(G, ctx, "beatGong");
    } else {
        changeJinnStage(G, ctx, "beatGong");
    }
}
