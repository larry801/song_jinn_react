import {UNIT_FULL_NAME, UNIT_SHORTHAND} from "../constants/general";
import {getCityByID} from "../constants/cities";
import {getRegionById, HILLS, MOUNTAINS, FLATLAND, SWAMP, RAMPART} from "../constants/regions";
import {combatResultTable} from "../constants/crt";

const accumulator = (accumulator, currentValue) => accumulator + currentValue;

export function findLeadingPlayer(G) {
    if (G.pub.jinn.civil > G.pub.song.civil) {
        return G.jinnPlayer;
    } else {
        return G.songPlayer;
    }
}

export function getCurrentPlayerID(ctx) {
    return ctx.playOrder[ctx.playOrderPos]
}

export function curPlayerPrivate(G, ctx) {
    let id = getCurrentPlayerID(ctx);
    return G.player[id];
}

export function curPub(G, ctx) {
    if (getCurrentPlayerID(ctx) === '0') {
        return G.pub.song;
    } else {
        return G.pub.jinn;
    }
}

export function stackLimitReached(G, ctx, arg, dst) {
    let limit = G.pub.song.activeEvents.includes("斥候铺") ? 12 : 10
    let newTroop = arg.all ? arg.src : arg.new;
    return countTroop(songTroopInRegion(G, ctx, dst)) + countTroop(newTroop) > limit;
}

export function countTroop(troop) {
    return troop.units.reduce(accumulator)
}

export function songTroopInCity(G, ctx, city) {
    for (let troop of G.pub.song.troops) {
        if (troop.city === city) {
            return troop;
        }
    }
    return false;
}

export function songTroopInRegion(G, ctx, region) {
    for (let troop of G.pub.song.troops) {
        if (troop.region === region) {
            return troop;
        }
    }
    return false;
}

export function jinnTroopInCity(G, ctx, city) {
    for (let troop of G.pub.jinn.troops) {
        if (troop.city === city) {
            return troop;
        }
    }
    return false;
}

export function jinnTroopInRegion(G, ctx, region) {
    for (let troop of G.pub.jinn.troops) {
        if (troop.region === region) {
            return troop
        }
    }
    return false;
}

export function getOpponentObj(G, ctx) {
    if (getCurrentPlayerID(ctx) === '0') {
        return G.pub.jinn;
    } else {
        return G.pub.song;
    }
}

export function drawStrategicPlans(G, ctx, playerID) {
    let player = getStateById(G, ctx, playerID);
    let planCardCount = player.military;
    let playerSecret = G.player[playerID];
    for (let i = 0; i < planCardCount; i++) {
        playerSecret.availablePlans.push(G.secret.strategicPlanCardDeck.shift());
    }
}

export function addMidTermCard(G, ctx) {
    for (let i = 17; i < 41; i++) {
        G.secret.songEventCardDeck.push(i);
        G.secret.jinnEventCardDeck.push(i);
    }
    G.secret.songEventCardDeck = ctx.random.Shuffle(G.secret.songEventCardDeck);
    G.secret.jinnEventCardDeck = ctx.random.Shuffle(G.secret.jinnEventCardDeck);
    for (let i = 7; i < 19; i++) {
        G.secret.strategicPlanCardDeck.push(i)
    }
    G.secret.strategicPlanCardDeck = ctx.random.Shuffle(G.secret.strategicPlanCardDeck)
}

export function addLateTermCards(G, ctx) {
    for (let i = 41; i < 51; i++) {
        G.secret.songEventCardDeck.push(i);
        G.secret.jinnEventCardDeck.push(i);
    }
    G.secret.songEventCardDeck = ctx.random.Shuffle(G.secret.songEventCardDeck);
    G.secret.jinnEventCardDeck = ctx.random.Shuffle(G.secret.jinnEventCardDeck);
    for (let i = 19; i < 25; i++) {
        G.secret.strategicPlanCardDeck.push(i)
    }
    G.secret.strategicPlanCardDeck = ctx.random.Shuffle(G.secret.strategicPlanCardDeck)
}


export function isSiegeTroop(G, ctx, troop) {
    if (troop.region === 0) return false;
    if (troop.city !== 0) return false;
    let region = getRegionById(troop.region);
    if (troop.units.length === 7) {
        return songTroopInCity(G, ctx, region.cityID);
    } else {
        return jinnTroopInCity(G, ctx, region.cityID);
    }
}

export function isCityUnderSiege(G, ctx, cityID) {
    let city = getCityByID(cityID);
    let region = getRegionById(city.region);
    if (songTroopInCity(G, ctx, cityID)) {
        return jinnTroopInRegion(G, ctx, region.id);
    } else {
        if (jinnTroopInCity(G, ctx, cityID)) {
            return songTroopInRegion(G, ctx, region.id);
        } else {
            return false;
        }
    }

}

export function isSiegeTarget(G, ctx, troop) {
    if (troop.city === 0) return false;
    let city = getCityByID(troop.city);
    let region = getRegionById(city.region);
    if (troop.region === region.cityID) return false;
    if (troop.units.length === 7) {
        return songTroopInRegion(G, ctx, region.id);
    } else {
        return jinnTroopInRegion(G, ctx, region.id);
    }
}

export function canSupplySong(G, ctx, city) {
    return songControlCity(G, ctx, city) && (!isCityUnderSiege(G, ctx, city))
}

export function canSupplyJinn(G, ctx) {

}

export function removeGeneral(G, ctx, pub, name) {
    pub.generals[name].present = false;
    let i = pub.supplementBank[7].indexOf(name);
    if (i !== -1) {
        pub.supplementBank[7].splice(i, 1);
        return G;
    }
    for (let troop of pub.troops) {
        i = troop.general.indexOf(name);
        if (i !== -1) {
            troop.general.splice(i, 1);
        }
    }
}

export function troopToString(troop) {
    if (troop.units.length === 7) {
        return jinnTroopStr(troop.units);
    } else {
        return songTroopStr(troop.units);
    }
}

export function unitsToString(units) {
    if (units.length === 7) {
        return jinnTroopStr(units);
    } else {
        return songTroopStr(units);
    }
}

export function removeTroop(G, ctx, troop) {
    let p = curPub(G, ctx)
    let t = p.troops
    t.splice(t.indexOf(troop), 1)
    troop.units.forEach((i, idx, arr) => {
        p.reserveBank[idx] += i;
    })
}

export function getPolicy(G, ctx) {
    let policy = G.pub.song.policy
    if (G.pub.song.activeEvents.includes("李纲")) {
        return policy > 1 ? 3 : policy + 2;
    } else {
        return policy
    }
}

export function jinnTroopStr(units) {
    let result = ""
    units.forEach((item, index, array) => {
        if (item > 0) {
            result = result.concat(item.toString(), UNIT_SHORTHAND[1][index]);
        }
    })
    return result;
}

export function songTroopStr(units) {
    let result = ""
    units.forEach((item, index, array) => {
        if (item > 0) {
            result = result.concat(item.toString(), UNIT_SHORTHAND[0][index]);
        }
    })
    return result;
}

export function getSongNationalPower(G, ctx) {
    let power = 0;
    let provinceWithPower = [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,];
    if (G.pub.song.activeEvents.indexOf("建炎南渡") !== -1) {
        power++;
    }
    if (G.pub.song.activeEvents.indexOf("向海上发展") !== -1) {
        provinceWithPower.push(16);
    }
    if (G.pub.song.emperor.exist) {
        power++;
    }
    for (let p of G.pub.song.provinces) {
        if (provinceWithPower.indexOf(p) !== -1) {
            power++;
        }
    }
    if (G.pub.song.civil > 5) {
        power++;
    }
    if (G.pub.jinn.activeEvents.indexOf("靖康之变") !== -1) {
        power--;
    }
    return power;
}

export function getJinnNationalPower(G, ctx) {
    let power = 0;
    let provinceWithPower = [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,];
    if (G.pub.jinn.emperor.exist) {
        power++;
    }
    if (G.pub.jinn.civil > 5) {
        power++;
    }
    if (G.pub.song.activeEvents.indexOf("向海上发展") !== -1) {
        provinceWithPower.push(16);
    }
    for (let p of G.pub.jinn.provinces) {
        if (provinceWithPower.indexOf(p) !== -1) {
            power++;
        }
    }
    if (G.pub.jinn.activeEvents.indexOf("靖康之变") !== -1) {
        power++;
    }
    if (G.pub.jinn.civil > 5) {
        power++;
    }
    return power;
}

export function curPlayerInStage(ctx, stage) {
    if (ctx.activePlayers !== null) {
        for (let pair of Object.entries(ctx.activePlayers)) {
            if (pair[0] === ctx.currentPlayer && pair[1] === stage) {
                return true
            }
        }
    }
    return false
}

export function drawPhaseForJinn(G, ctx) {
    let hands = G.player[G.jinnPlayer].hands;
    let handCount = hands.length;
    let power = getJinnNationalPower(G, ctx);
    let drawCount = 0;
    if (handCount + power > 9) {
        drawCount = 9 - handCount;
    } else {
        drawCount = power
    }
    for (let i = 0; i < drawCount; i++) {
        drawCardForJinn(G, ctx)
    }
}

export function drawCardForJinn(G, ctx) {
    let hands = G.player[G.jinnPlayer].hands;

    let deck = G.secret.jinnEventCardDeck;
    hands.push(deck.shift());
    if (deck.length === 0) {
        G.secret.jinnEventCardDeck = ctx.random.Shuffle(deck);
    }
}

export function drawPhaseForSong(G, ctx) {
    let hands = G.player[G.songPlayer].hands;
    let handCount = hands.length;
    let power = getSongNationalPower(G, ctx);
    let drawCount = 0;
    if (handCount + power > 9) {
        drawCount = 9 - handCount;
    } else {
        drawCount = power
    }
    for (let i = 0; i < drawCount; i++) {
        drawCardForSong(G, ctx)
    }
}

export function drawCardForSong(G, ctx) {
    let hands = G.player[G.songPlayer].hands;
    let deck = G.secret.songEventCardDeck;
    hands.push(deck.shift());
    if (deck.length === 0) {
        G.secret.songEventCardDeck = ctx.random.Shuffle(deck);
    }
}

export function playerInStage(ctx, player, stage) {
    return ctx.activePlayers !== null && ctx.activePlayers.hasOwnProperty(player) && ctx.activePlayers[player] === stage;
}

export function currentPlayerInStage(ctx, stage) {
    return playerInStage(ctx, ctx.currentPlayer, stage);
}

export function getStateById(G, ctx, playerID) {
    if (G.songPlayer === playerID) {
        return G.pub.song;
    } else {
        if (G.jinnPlayer === playerID) {
            return G.pub.jinn;
        }
    }

}

export function getRecruitTotalCost(G, ctx, units) {
    let recruitPlayerID = parseInt(ctx.currentPlayer);
    let cost = G.recruitCost[recruitPlayerID];
    let totalCost = 0;
    for (let i = 0; i < cost.length; i++) {
        totalCost = totalCost + units[i] * cost[i];
    }
    return totalCost
}

export function getAdjacentRegion(G, ctx, id) {
    let regionObj = getRegionById(id);
    let land = regionObj.landAdjacent;
    let water = regionObj.waterAdjacent;
    return land.concat(water);
}

export function getMarchDestination(G, ctx, id) {
    let regions = [];
    //console.log(id, getAdjacentRegion(G, ctx, id));
    for (let r of getAdjacentRegion(G, ctx, id)) {
        for (let rAdj of getAdjacentRegion(G, ctx, r)) {
            if ((!regions.includes(rAdj)) && regions !== id) {
                regions.push(rAdj);
            }
        }
    }
    return regions
}

export function hasBoat(troop) {
    return troop.units[3] > 0;
}

export function canMarchWithBoat(G, ctx, arg) {
    if ((arg.all && hasBoat(arg.src)) || (!arg.all && hasBoat(arg.new))) {
        //  TODO 相邻河流边界
        return true;
    } else {
        return false;
    }
}

export function canMarchWithHorse(G, ctx, arg) {
    let u;
    if (arg.all) {
        u = arg.src.units;
    } else {
        u = arg.new.units;

    }
    if (u.length === 7) {
        return u[0] === 0 && u[3] === 0 && u[5] === 0 && u[6] === 0
    } else {
        return u[0] === 0 && u[1] === 0 && u[3] === 0 && u[4] === 0 && u[5] === 0
    }
}

/*
背嵬军/李显忠
 */
export function canUseSpecialMarch(G, ctx, arg) {
    let u;
    if (arg.all) {
        if (arg.src.general.includes("李显忠")) {
            return true;
        }
        u = arg.src.units;
    } else {
        if (arg.new.general.includes("李显忠")) {
            return true;
        }
        u = arg.new.units;
    }
    return u.length === 6 && u[0] === 0 && u[1] === 0 && u[2] === 0 && u[3] === 0
}

export function canMarch(G, ctx, arg) {
    // TODO 没有断补
    // TODO 确定行军方式
}

export function canRecruit(G, ctx, units, ignoreCivilTechLimit = false) {
    let state = getStateById(G, ctx, ctx.currentPlayer);
    let supplement = state.supplementBank;
    let permission = state.recruitPermission;
    for (let i = 0; i < units.length; i++) {
        if (!permission[i]) {
            if (units[i] > 0) {
                return false
            }
        }
    }
    let supplementCount = supplement.reduce(accumulator);
    let recruitCount = units.reduce(accumulator);
    let supAfterThisRecruit = parseInt(recruitCount) + parseInt(supplementCount);
    if (!ignoreCivilTechLimit) {
        if (supAfterThisRecruit > state.civil) {
            return false
        }
    }
    let totalCost = getRecruitTotalCost(G, ctx, units);
    let result = totalCost <= G.opForRecruitAndMarch;
    console.log(result);
    return result;
}

/*
部队算子不足
 */
export function isUnitCounterInsufficient(G, ctx, units) {
    let state = curPub(G, ctx);
    let bank = state.reserveBank;
    for (let i = 0; i < units.length; i++) {
        if (bank[i] < units[i]) {
            return true
        }
    }
    return false
}

export function enumerateVassalRegions(G, ctx) {
    return jinnControlCities(G, ctx,).filter((city) => city.colonizeLevel <= G.pub.jinn.military)
}

export function jinnControlProvince(G, ctx, province) {
    return G.pub.jinn.provinces.includes(province)
}

export function songControlProvince(G, ctx, province) {
    return G.pub.song.provinces.includes(province)
}

export function jinnControlCity(G, ctx, city) {
    let objCity = getCityByID(city);
    if (jinnControlProvince(objCity.province)) {
        if (G.jinn.colonization < objCity.colonizeLevel) {
            return songTroopInCity(G, ctx, city) === false;
        } else {
            return jinnTroopInCity(G, ctx, city) !== false;
        }
    } else {
        return jinnTroopInCity(G, ctx, city) !== false;
    }
}

export function songControlCity(G, ctx, city) {
    let objCity = getCityByID(city);
    if (songControlProvince(G, ctx, objCity.province)) {
        return jinnTroopInCity(G, ctx, city) !== false;
    } else {
        return songTroopInCity(G, ctx, city) !== false;
    }
}

export function jinnControlCities(G, ctx) {
    let cities = []
    let c;
    for (c = 1; c < 36; c++) {
        if (jinnControlCity(G, ctx, c)) cities.push(c);
    }
    return cities;
}

export function troopIsArmy(G, ctx, troop) {
    return troopEndurance(G, ctx, troop) !== 0;
}

export function songControlCities(G, ctx) {
    let cities = []
    let c;
    for (c = 1; c < 36; c++) {
        if (songControlCity(G, ctx, c)) cities.push(c);
    }
    return cities;
}

export function rangeStrength(G, ctx, troop) {
    let terrainType = getRegionById(troop.region).terrainType;
    let unitStrength;
    if (troop.units.length === 7) {
        if (terrainType === HILLS) {
            unitStrength = [0, 2, 0, 0, 0, 0, 0]
        }
        if (terrainType === MOUNTAINS) {
            unitStrength = [0, 1, 1, 0, 0, 1, 1]
        }
        if (terrainType === SWAMP) {
            unitStrength = [0, 2, 2, 0, 0, 1, 1]
        }
        if (terrainType === FLATLAND) {
            unitStrength = [0, 2, 0, 2, 0, 1, 1]
        }
    } else {
        if (terrainType === HILLS) {
            unitStrength = [0, 0, 2, 0, 0, 1]
        }
        if (terrainType === MOUNTAINS) {
            unitStrength = [0, 0, 1, 0, 0, 1]
        }
        if (terrainType === SWAMP) {
            unitStrength = [0, 0, 1, 0, 0, 1]
        }
        if (terrainType === FLATLAND) {
            unitStrength = [0, 0, 3, 0, 0, 1]
        }
    }
    let strength = 0;
    troop.units.forEach((i, idx, arr) => {
        strength += i * unitStrength[idx]
    })
    return strength
}

export function unitsFromTroop(troop) {
    let unitNames = []
    if (troop.units.length === 7) {
        troop.units.forEach((i, idx, arr) => {
            for (let j = 0; j < i; j++) {
                unitNames.push(UNIT_FULL_NAME[1][idx])
            }
        })
    } else {
        troop.units.forEach((i, idx, arr) => {
            for (let j = 0; j < i; j++) {
                unitNames.push(UNIT_FULL_NAME[0][idx])
            }
        })
    }
    return unitNames.concat(troop.general)
}

export function troopEndurance(G, ctx, troop) {
    let terrainType = getRegionById(troop.region).terrainType;
    let unitEndurance;
    if (troop.units.length === 7) {
        unitEndurance = [2, 1, 2, 0, 0, 1, 1];
        if (terrainType === SWAMP) {
            unitEndurance[3] = 2;
        }

    } else {
        unitEndurance = [2, 1, 1, 0, 0, 2]
        if (G.song.activeEvents.indexOf("普及重步兵") !== -1) {
            unitEndurance[0] = 3;
        }
        if (terrainType === SWAMP) {
            unitEndurance[3] = 2;
        }
    }
    let endurance = 0;
    troop.units.forEach((i, idx, arr) => {
        endurance += i * unitEndurance[idx]
    })
    return endurance
}

export function meleeStrength(G, ctx, troop) {
    let terrainType = getRegionById(troop.region).terrainType;
    let unitStrength;
    if (troop.units.length === 7) {
        if (terrainType === HILLS) {
            unitStrength = [1, 0, 2, 0, 0, 1, 1]
        }
        if (terrainType === MOUNTAINS) {
            unitStrength = [1, 0, 1, 0, 0, 1, 1]
        }
        if (terrainType === SWAMP) {
            unitStrength = [1, 0, 1, 0, 0, 1, 1]
        }
        if (terrainType === FLATLAND) {
            unitStrength = [1, 0, 3, 0, 0, 1, 1]
        }
    } else {
        if (terrainType === HILLS) {
            unitStrength = [1, 0, 2, 0, 0, 1]
        }
        if (terrainType === MOUNTAINS) {
            unitStrength = [1, 0, 1, 0, 0, 1]
        }
        if (terrainType === SWAMP) {
            unitStrength = [1, 0, 1, 0, 0, 1]
        }
        if (terrainType === FLATLAND) {
            unitStrength = [1, 0, 3, 0, 0, 1]
        }
    }
    let strength = 0;
    troop.units.forEach((i, idx, arr) => {
        strength += i * unitStrength[idx]
    })
    return strength
}

export function canPeaceTalk(G, ctx) {
    if (getPolicy(G, ctx) > 0) {
        return false;
    }
    return songControlCities(G, ctx).filter((city) => getCityByID(city).colonizeLevel === 0).length === 0;
}

export function songTroopInCountry(G, ctx, country) {
    for (let troop of G.pub.song.troops) {
        if (troop.otherCountry === country) return true;
    }
    return false;
}

export function jinnTroopInCountry(G, ctx, country) {
    for (let troop of G.pub.jinn.troops) {
        if (troop.otherCountry === country) return true;
    }
    return false;
}

export function playerTroopInCountry(G, ctx, playerID, country) {
    return playerID === G.songPlayer ? songTroopInCountry(G, ctx, country) : jinnTroopInCountry(G, ctx, country);
}

export function playerTroopInRegion(G, ctx, playerID, region) {
    let troops = playerID === G.songPlayer ? G.pub.song.troops : G.pub.jinn.troops;
    for (let troop of troops) {
        if (troop.region === region) return true;
    }
    return false;
}

export function canSubmitLetterOfCredence(G, ctx, playerID, country) {
    if (!G.otherCountries[country].exist) return false;
    if (playerID === G.songPlayer && country === "高丽" && G.pub.jinn.activeEvents.includes("不见来使")) return false;
    let troop = playerTroopInCountry(G, ctx, playerID, country);
    if (troop !== false) {
        return true;
    } else {
        return G.otherCountries[country].regionsForDiplomacy.some((r) =>
                playerTroopInRegion(G, ctx, playerID, r)
            )
            ||
            G.otherCountries[country].adjacent.some((c) =>
                playerTroopInCountry(G, ctx, playerID, c)
            )
    }

}

export function mergeTroopTo(G, ctx, src, dst) {
    for (let i = 0; i < dst.units.length; i++) {
        dst.units[i] += src.units[i];
    }
    src.general.forEach((item, index, array) => {
        dst.general.push(item);
    })
}

export function splitTroopFrom(src, dst) {
    for (let i = 0; i < src.units.length; i++) {
        src.units[i] -= dst.units[i];
    }
    dst.general.forEach((item, index, array) => {
        let pos = src.general.indexOf(item);
        src.general.splice(pos, 1);
    })
}

export function getDevelopCost(G, ctx, arg) {
    let cost = 0;
    let p = curPub(G, ctx);
    for (let c = p.civil; c < arg.civil; c++) {
        cost += (c + 1);
    }
    for (let c = p.military; c < arg.military; c++) {
        cost += (c + 1);
    }
    if (p.hasOwnProperty('policy')) {
        cost += (arg.policy - p.policy) * 3;
    }
    if (p.hasOwnProperty('colonization')) {
        for (let c = p.colonization; c < arg.colonization; c++) {
            cost += ((c + 1) * 2);
        }
    }
    return cost;
}

export function canDevelop(G, ctx, arg) {

}

export function getColonization(G, ctx, cityID) {
    // TODO　zz other country mountain pass
    let c = getCityByID(cityID);
    if (G.pub.song.generals["宗泽"].exists) {
        let cityTroop = songTroopInCity(G, ctx, cityID)
        if (cityTroop !== false && cityTroop.general.includes("宗泽")) {
            return c.colonizeLevel + 1;
        }
        let region = getRegionById(c.region)
        let allAdjacent = region.landAdjacent.concat(
            region.waterAdjacent,
            region.mountainAdjacent,
            region.adjacentThroughMountainPass,
        )
        for (let r in allAdjacent) {
            let t = songTroopInRegion(G, ctx, r);
            if (t.general.includes("宗泽")) {
                return c.colonizeLevel + 1;
            }
        }
    }else {
        return c.colonizeLevel;
    }
}

export function getSongRangeStrength(G, ctx) {
    let t = G.combatInfo.song.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let oriStrength = rangeStrength(G, ctx, G.combatInfo.song.troop);
    let strength = oriStrength;
    if (G.combatInfo.song.troop.general.includes("李显忠")) {
        strength += t.units[5]
    }
    if (G.combatInfo.song.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units[1] + t.units[5];
            if (terrain === SWAMP) {
                strength += t.units[3];
            }
        }
        if (G.combatInfo.song.troop.general.includes("吴磷")) {
            strength += t.units[1];
            strength += t.units[5];
            if (terrain === SWAMP) {
                strength += t.units[3];
            }
        }
        strength += getPolicy(G, ctx);
    } else {
        if (G.combatInfo.song.troop.general.includes("吴玠")) {
            strength += t.units[1];
            strength += t.units[5];
            if (terrain === SWAMP) {
                strength += t.units[3];
            }
        }
    }
    if (strength < 1) strength = 1;
    return strength;
}

export function getSongRangeDice(G, ctx) {
    if (G.useCombatResultTable) {
        if (G.combatInfo.jinn.combatCards.includes(14)) {
            return 1;
        } else {
            return 2;
        }
    } else {
        return getSongRangeStrength(G, ctx);
    }
}

export function getSongRangeDamage(G, ctx) {
    let dices = ctx.random.D6(getSongRangeDice(G, ctx))
    G.combatInfo.song.dices = dices;
    if (G.useCombatResultTable) {
        let sum = dices.reduce(accumulator);
        return combatResultTable(getSongRangeStrength(G, ctx,), sum);
    } else {
        return dices.filter((d) => d >= 5).length
    }
}

export function getJinnRangeStrength(G, ctx) {
    let t = G.combatInfo.jinn.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let strength = 0;
    if (G.combatInfo.jinn.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units[1] + t.units[4]
            if (G.pub.jinn.activeEvents.includes("建立大齐") && G.pub.jinn.military >= 5) {
                strength += t.units[5];
                strength += t.units[6];
            }
        } else {
            strength = rangeStrength(G, ctx, t)
        }
    } else {
        strength = rangeStrength(G, ctx, t)
    }
    return strength;
}

export function getJinnRangeDice(G, ctx) {
    if (G.useCombatResultTable) {
        return 2;
    } else {
        return getJinnRangeStrength(G, ctx);
    }
}

export function getJinnRangeDamage(G, ctx) {
    let dices = ctx.random.D6(getJinnRangeDice(G, ctx))
    G.combatInfo.jinn.dices = dices;
    if (G.useCombatResultTable) {
        let sum = dices.reduce(accumulator);
        return combatResultTable(getJinnRangeStrength(G, ctx,), sum);
    } else {
        return dices.filter((d) => d >= 5).length
    }
}

export function getSongWuLinDamage(G, ctx) {

}

export function getSongTackleStrength(G, ctx) {
    let t = G.combatInfo.jinn.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let strength = 0;
    if (G.combatInfo.song.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units.reduce(accumulator);
        } else {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t);
        }
        strength += getPolicy(G, ctx);
    } else {
        if (terrain === RAMPART) {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t) + t.units[5] * 3;

        } else {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t);
        }
    }
}

export function getSongTackleDamage(G, ctx) {
    return 0;
}

export function getJinnTackleDamage(G, ctx) {
    return 0;
}
