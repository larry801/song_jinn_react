import {UNIT_FULL_NAME, UNIT_SHORTHAND} from "../constants/general";
import {getCityByID} from "../constants/cities";
import {FLATLAND, getRegionById, HILLS, MOUNTAINS, RAMPART, SWAMP} from "../constants/regions";
import {combatResultTable} from "../constants/crt";

export const accumulator = (accumulator, currentValue) => accumulator + currentValue;

export function findLeadingPlayer(G) {
    if (G.jinn.civil > G.song.civil) {
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
    if (getCurrentPlayerID(ctx) === G.songPlayer) {
        return G.song;
    } else {
        return G.jinn;
    }
}

export function stackLimitReached(G, ctx, arg, dst) {
    let limit = G.song.activeEvents.includes("斥候铺") ? 12 : 10
    let newTroop = arg.all ? arg.src : arg.new;
    return countTroop(songTroopInRegion(G, ctx, dst)) + countTroop(newTroop) > limit;
}

export function countTroop(troop) {
    return troop.units.reduce(accumulator)
}

export function songTroopInCity(G, ctx, city) {
    for (let troop of G.song.troops) {
        if (troop.city === city) {
            return troop;
        }
    }
    return false;
}

export function songTroopInRegion(G, ctx, region) {
    for (let troop of G.song.troops) {
        if (troop.region === region) {
            return troop;
        }
    }
    return false;
}

export function jinnTroopInCity(G, ctx, city) {
    for (let troop of G.jinn.troops) {
        if (troop.city === city) {
            return troop;
        }
    }
    return false;
}

export function jinnTroopInRegion(G, ctx, region) {
    for (let troop of G.jinn.troops) {
        if (troop.region === region) {
            return troop
        }
    }
    return false;
}

export function getOpponentObj(G, ctx) {
    if (getCurrentPlayerID(ctx) === G.songPlayer) {
        return G.jinn;
    } else {
        return G.song;
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
    if (name === "岳飞" && G.song.activeEvents.includes(41)) {
        G.song.activeEvents.splice(G.song.activeEvents.indexOf(41), 1);
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
    let policy = G.song.policy
    if (G.song.activeEvents.includes("李纲")) {
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
    if (G.song.activeEvents.indexOf("建炎南渡") !== -1) {
        power++;
    }
    if (G.song.activeEvents.indexOf("向海上发展") !== -1) {
        provinceWithPower.push(16);
    }
    if (G.song.emperor.exist) {
        power++;
    }
    for (let p of G.song.provinces) {
        if (provinceWithPower.indexOf(p) !== -1) {
            power++;
        }
    }
    if (G.song.civil > 5) {
        power++;
    }
    if (G.jinn.activeEvents.indexOf("靖康之变") !== -1) {
        power--;
    }
    return power;
}

export function getJinnNationalPower(G, ctx) {
    let power = 0;
    let provinceWithPower = [1, 2, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15,];
    if (G.jinn.emperor.exist) {
        power++;
    }
    if (G.jinn.civil > 5) {
        power++;
    }
    if (G.song.activeEvents.indexOf("向海上发展") !== -1) {
        provinceWithPower.push(16);
    }
    for (let p of G.jinn.provinces) {
        if (provinceWithPower.indexOf(p) !== -1) {
            power++;
        }
    }
    if (G.jinn.activeEvents.indexOf("靖康之变") !== -1) {
        power++;
    }
    if (G.jinn.civil > 5) {
        power++;
    }
    return power;
}

export function curPlayerInStage(G, ctx, stage) {
    if (G.logDiscrepancyWorkaround) {
        return G.stage === stage;
    } else {
        if (ctx.activePlayers !== null) {
            for (let pair of Object.entries(ctx.activePlayers)) {
                if (pair[0] === ctx.currentPlayer && pair[1] === stage) {
                    return true
                }
            }
        }
        return false
    }
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

export function getStateById(G, ctx, playerID) {
    if (G.songPlayer === playerID) {
        return G.song;
    } else {
        if (G.jinnPlayer === playerID) {
            return G.jinn;
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

export function getMarchDestination(G, ctx, id, marchType = "normal", noCombat = false, noSupplyShortage = false) {
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
    return jinnControlCities(G, ctx,).filter((city) => city.colonizeLevel <= G.jinn.military)
}

export function jinnControlProvince(G, ctx, province) {
    return G.jinn.provinces.includes(province)
}

export function songControlProvince(G, ctx, province) {
    return G.song.provinces.includes(province)
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
    let terrainType;
    if (troop.region === 0) {
        terrainType = getRegionById(getCityByID(troop.city).region).terrainType
    } else {
        terrainType = getRegionById(troop.region).terrainType;
    }
    let unitEndurance;
    if (troop.units.length === 7) {
        unitEndurance = [2, 1, 2, 0, 0, 1, 1];
        if (terrainType === SWAMP) {
            unitEndurance[3] = 2;
        }
    } else {
        unitEndurance = [2, 1, 1, 0, 0, 2]
        if (G.song.activeEvents.includes("普及重步兵")) {
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
            unitStrength = [1, 0, 2, 0, 0, 2]
        }
        if (terrainType === MOUNTAINS) {
            unitStrength = [1, 0, 1, 0, 0, 2]
        }
        if (terrainType === SWAMP) {
            unitStrength = [1, 0, 1, 0, 0, 2]
        }
        if (terrainType === FLATLAND) {
            unitStrength = [1, 0, 3, 0, 0, 2]
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
    for (let troop of G.song.troops) {
        if (troop.otherCountry === country) return true;
    }
    return false;
}

export function jinnTroopInCountry(G, ctx, country) {
    for (let troop of G.jinn.troops) {
        if (troop.otherCountry === country) return true;
    }
    return false;
}

export function playerTroopInCountry(G, ctx, playerID, country) {
    return playerID === G.songPlayer ? songTroopInCountry(G, ctx, country) : jinnTroopInCountry(G, ctx, country);
}

export function playerTroopInRegion(G, ctx, playerID, region) {
    let troops = playerID === G.songPlayer ? G.song.troops : G.jinn.troops;
    for (let troop of troops) {
        if (troop.region === region) return true;
    }
    return false;
}

export function canSubmitLetterOfCredence(G, ctx, playerID, country) {
    if (!G.otherCountries[country].exist) return false;
    if (playerID === G.songPlayer && country === "高丽" && G.jinn.activeEvents.includes("不见来使")) return false;
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
    if (G.song.generals["宗泽"].exists) {
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
    } else {
        return c.colonizeLevel;
    }
}

export function getCitySupply(G, ctx, cityID) {
    let c = getCityByID(cityID);
    let supply = c.capital ? 2 : 1;
    if (G.jinn.emperor.city === cityID) {
        supply++;
    }
    let t = songTroopInCity(G, ctx, cityID);
    if (t !== false) {
        if (G.song.emperor.city === cityID) supply++;
        if (t.general.includes("宗泽")) supply++;
    }
    return supply;
}

export function getCityDefense(G, ctx, cityID) {
    let c = getCityByID(cityID);
    let defense = c.capital ? 2 : 1;
    if (jinnTroopInCity(G, ctx, cityID) !== false) {
        if (G.jinn.emperor.city === cityID) {
            defense++;
        }
    }
    if (songTroopInCity(G, ctx, cityID !== false && G.song.emperor.city === cityID)) {
        defense++;
    }
    if (G.combat.generalOneTimeSkill.includes("奔睹")) {
        defense *= 2;
    }
    return defense;
}

/*
*
* */
export function crtDicesToDamage(dices, strength) {
    let sum;
    if (dices.length === 0) return 0;
    if (dices.length === 1) sum = dices[0];
    if (dices.length === 2) sum = dices[0] + dices[1];
    if (dices.length > 2) {
        dices.sort((a, b) => b - a);
        sum = dices[0] + dices[1];
    }
    return combatResultTable(strength, sum);
}

export function getSongRangeStrength(G, ctx) {
    let t = G.combatInfo.song.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let strength = rangeStrength(G, ctx, G.combatInfo.song.troop);
    if (G.combatInfo.song.troop.general.includes("李显忠")) {
        strength += t.units[5]
    }
    if (G.combatInfo.song.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units[1] + t.units[5];
            if (terrain === SWAMP) {
                strength += t.units[3];
            }
            strength -= getCityDefense(G, ctx, getRegionById(t.region).cityID);
        }
        if (G.combatInfo.song.troop.general.includes("吴璘")) {
            strength += t.units[1];
            strength += t.units[5];
            if (terrain === SWAMP) {
                strength += t.units[3];
            }
        }
        strength += getPolicy(G, ctx);
    } else {
        if (G.combatInfo.isSiege) {
            if (G.jinn.activeEvents.includes(12)) {
                strength -= getCityDefense(G, ctx, getRegionById(t.region).cityID);
            } else {
                strength += getCityDefense(G, ctx, getRegionById(t.region).cityID);
            }
        }
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
        return songCRTDice(G, ctx);
    } else {
        return getSongRangeStrength(G, ctx);
    }
}

function dice(face, num) {
    let result = [];
    for (let i = 0; i < num; i++) {
        result.push(Math.ceil(Math.random() * face))
    }
    return result;
}

export function getSongRangeDamage(G, ctx, simulate = false) {
    let dices;
    let num = getSongRangeDice(G, ctx);
    if (simulate) {
        dices = dice(6, num)
    } else {
        dices = ctx.random.D6(num)
    }
    G.combatInfo.song.dices = dices;
    if (G.useCombatResultTable) {
        crtDicesToDamage(dices, getSongRangeStrength(G, ctx,));
    } else {
        let drm = 0;
        if (G.song.activeEvents.includes(41)) drm++;
        return dices.filter((d) => d + drm >= 5).length
    }
}

export function getJinnRangeStrength(G, ctx) {
    let i = G.combatInfo;
    let t = i.jinn.troop;
    let strength = 0;
    if (i.jinn.isAttacker) {
        if (i.isSiege) {
            strength = t.units[1] + t.units[4]
            if (G.jinn.activeEvents.includes("建立大齐") && G.jinn.military >= 5) {
                strength += t.units[5];
                strength += t.units[6];
            }
            if (G.jinn.activeEvents.includes(12)) {
                strength += getCityDefense(G, ctx, getRegionById(t.region).cityID);
            } else {
                strength -= getCityDefense(G, ctx, getRegionById(t.region).cityID);
            }
        } else {
            strength = rangeStrength(G, ctx, t)
        }
    } else {
        strength = rangeStrength(G, ctx, t)
        if (G.combatInfo.isSiege) {
            strength += getCityDefense(G, ctx, getRegionById(t.region).cityID);
        }
    }
    if (t.general.includes("兀术") && i.jinn.isAttacker) strength += 2;
    return strength;
}

export function getJinnRangeDice(G, ctx) {
    if (G.useCombatResultTable) {
        return jinnCRTDice(G, ctx);
    } else {
        return getJinnRangeStrength(G, ctx);
    }
}

export function getJinnRangeDamage(G, ctx, simulate = false) {
    let num = getJinnRangeDice(G, ctx);
    let dices;
    if (simulate) {
        dices = dice(6, num)
    } else {
        dices = ctx.random.D6(num)
    }
    G.combatInfo.jinn.dices = dices;
    if (G.useCombatResultTable) {

    } else {
        let drm = 0;
        let i = G.combatInfo;
        let region = i.jinn.troop.region;
        let generals = i.jinn.troop.general;
        if (i.isSiege && i.jinn.isAttacker && i.song.troop.general.includes("宗泽")) drm--;
        if (generals.includes("娄室") && getRegionById(region).terrainType === MOUNTAINS) drm++;
        if (generals.includes("粘罕") && getRegionById(region).terrainType === FLATLAND) drm++;
        if (i.song.isAttacker && (i.isBreakthrough || i.isRescue) && generals.includes("银术可")) drm++;
        return dices.filter((d) => d + drm >= 5).length
    }
}

export function getSongWuLinDamage(G, ctx, simulate = false) {
    let t = G.combatInfo.song.troop;
    let infantry = t.units[0];
    let archer = t.units[1];
    let pair = infantry > archer ? archer : infantry
    if (pair === 0) return 0;
    if (G.useCombatResultTable) {
        let dices;
        if (simulate) {
            dices = dice(6, 2)
        } else {
            dices = ctx.random.D6(2)
        }
        G.combatInfo.song.dices = dices;
        return crtDicesToDamage(dices, pair);
    } else {
        let dices;
        if (simulate) {
            dices = dice(6, pair)
        } else {
            dices = ctx.random.D6(pair)
        }
        G.combatInfo.song.dices = dices;
        let drm = 0
        if (G.song.activeEvents.includes(41)) drm++;
        return dices.filter((d) => d + drm >= 5).length;
    }
}

export function meleeSong(G, ctx, diceCount, simulate = false) {
    let dices;
    if (simulate) {
        dices = dice(6, diceCount)
    } else {
        dices = ctx.random.D6(diceCount)
    }
    G.combatInfo.song.dices = dices;
    let addDamage = 0;
    const i = G.combatInfo;
    const t = i.song.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    if (i.song.troop.general.includes("韩世忠") && terrain === SWAMP) addDamage++;
    if (i.song.troop.general.includes("岳飞")) addDamage++;
    if (G.useCombatResultTable) {
        crtDicesToDamage(dices, diceCount);
    } else {
        let drm = 0;
        if (G.song.activeEvents.includes(41)) drm++;
        return dices.filter((d) => d + drm >= 5).length + addDamage;
    }

}

export function getSongMeleeOnlyDamage(G, ctx, simulate = false) {
    return meleeSong(G, ctx, getSongMeleeOnlyDiceCount(G, ctx), simulate);
}

export function getSongMeleeOnlyDiceCount(G, ctx,) {
    if (G.useCombatResultTable) {
        return songCRTDice(G, ctx,)
    } else {
        return getSongMeleeOnlyStrength(G, ctx,)
    }
}

export function getSongMeleeOnlyStrength(G, ctx,) {
    let t = G.combatInfo.song.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let strength;
    if (G.combatInfo.song.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units.reduce(accumulator) - t.units[4];
        } else {
            strength = meleeStrength(G, ctx, t);
        }
        strength += getPolicy(G, ctx);
    } else {
        strength = meleeStrength(G, ctx, t);
    }
    return strength;
}

export function getSongMeleeStrength(G, ctx) {
    let t = G.combatInfo.song.troop;
    let terrain = t.region === 0 ? RAMPART : getRegionById(t.region).terrainType;
    let strength;
    if (G.combatInfo.song.isAttacker) {
        if (G.combatInfo.isSiege) {
            strength = t.units.reduce(accumulator) - t.units[4];
        } else {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t);
        }
        strength += getPolicy(G, ctx);
    } else {
        if (terrain === RAMPART) {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t) + t.units[4] * 3;
        } else {
            strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t);
        }
    }
    return strength;
}

export function getSongMeleeDice(G, ctx) {
    let i = G.combatInfo;
    if (G.useCombatResultTable) {
        return songCRTDice(G, ctx);
    } else {
        let additionalDice = 0;
        if (i.song.troop.general.includes("韩世忠") && i.song.troop.units[3] > 0) additionalDice = i.song.troop.units[3];
        return getSongRangeStrength(G, ctx) + getSongMeleeStrength(G, ctx) + additionalDice;
    }
}

export function getSongMeleeDamage(G, ctx, simulate = false) {
    return meleeSong(G, ctx, getSongMeleeDice(G, ctx), simulate);
}

export function getJinnMeleeStrength(G, ctx) {
    let i = G.combatInfo;
    let t = i.jinn.troop;
    let strength = 0;
    strength = rangeStrength(G, ctx, t) + meleeStrength(G, ctx, t);
    if (t.general.includes("兀术") && i.jinn.isAttacker) strength += 2;
    if (t.general.includes("斡离不")) {
        strength += t.units[1];
        strength += t.units[2];
    }
    return strength
}

export function songCRTDice(G, ctx,) {
    let count = 2;
    let t = G.combatInfo.song.troop;
    if (t.general.includes("韩世忠") && t.units[3] > 0) count++;
    if (G.combatInfo.jinn.combatCards.includes(14)) count--;
    return count;
}

export function jinnCRTDice(G, ctx) {
    let i = G.combatInfo;
    let t = i.jinn.troop;
    let count = 2;
    let region = t.region;
    if (i.isSiege && i.jinn.isAttacker) {
        if (i.song.troop.general.includes("宗泽")) count--;
        if (i.song.combatCards.includes(39)) count--;
    }
    if (t.general.includes("娄室") && getRegionById(region).terrainType === MOUNTAINS) count++;
    if (t.general.includes("粘罕") && getRegionById(region).terrainType === FLATLAND) count++;
    if (t.general.includes("银术可") && (i.isBreakthrough || i.isRescue)) count++;
    return count;
}

export function getJinnMeleeDice(G, ctx) {
    if (G.useCombatResultTable) {
        return jinnCRTDice(G, ctx)
    } else {
        return getJinnMeleeStrength(G, ctx);
    }
}

export function getJinnMeleeDamage(G, ctx, simulate = false) {
    let i = G.combatInfo;
    let num = getJinnMeleeDice(G, ctx);
    let dices;
    if (simulate) {
        dices = dice(6, num)
    } else {
        dices = ctx.random.D6(num)
    }
    i.jinn.dices = dices;
    if (G.useCombatResultTable) {
        return crtDicesToDamage(dices, getJinnMeleeStrength(G, ctx,),);
    } else {
        let drm = 0;
        return dices.filter((d) => d + drm >= 5).length
    }
}

export function getJinnBackupCount(G, ctx,) {
    return G.jinn.supplementBank.slice(0, 7).reduce(accumulator)
}

export function getSongBackupCount(G, ctx,) {
    return G.song.supplementBank.slice(0, 6).reduce(accumulator)
}

export function placeTroop(G, ctx, arg) {

}

export function songSupplementCities(G, ctx) {
    return songControlCities(G, ctx).filter(id => !isCityUnderSiege(G, ctx, id));
}

export function jinnSupplementCities(G, ctx) {
    return jinnControlCities(G, ctx)
        .filter(id => G.jinn.colonization > getColonization(G, ctx, id))
        .filter(id => isCityUnderSiege(G, ctx, id));
}

function basicSupply(G, ctx, cityID) {
    return getCityByID(cityID).capital ? 2 : 1
}

export function songCitySupply(G, ctx, cityID) {
    let sup = basicSupply(G, ctx, cityID);
    if (G.song.emperor.exist && G.song.emperor.city === cityID) {
        sup++;
    }
    const t = songTroopInCity(G, ctx, cityID);
    if (t !== false && t.general.includes("宗泽")) sup++;
    return sup;
}

export function jinnCitySupply(G, ctx, cityID) {
    let sup = basicSupply(G, ctx, cityID);
    if (G.jinn.emperor.exist && G.jinn.emperor.city === cityID) {
        sup++;
    }
    return sup;
}

export function jinnVassalCities(G, ctx,) {
    return jinnControlCities(G, ctx,).filter(id => G.jinn.military >= getColonization(G, ctx, id));
}

export function unitsToTroop(units) {
    let troop;
    let validUnitID;
    if (units.length === 0) return {
        units: [0, 0, 0, 0, 0, 0, 0],
        general: [],
        region: 0,
        city: 0,
    };
    if (units[0].owner === 'song') {
        validUnitID = [0, 1, 2, 3, 4, 5]
        troop = {
            units: [0, 0, 0, 0, 0, 0],
            general: [],
            region: 0,
            city: 0,
        }
    } else {
        validUnitID = [0, 1, 2, 3, 4, 5, 6]
        troop = {
            units: [0, 0, 0, 0, 0, 0, 0],
            general: [],
            region: 0,
            city: 0,
        }
    }
    for (let u of units) {
        if (validUnitID.includes(u.type)) {
            troop.units[u.type]++;
        } else {
            troop.general.push(u.name);
        }
    }
    return troop
}

export function troopToUnits(troop) {
    let units = [];
    let names;
    let owner;
    if (troop.units.length === 7) {
        owner = 'jinn'
        names = UNIT_SHORTHAND[1];
    } else {
        owner = 'song';
        names = UNIT_SHORTHAND[0];
    }
    let uid = 0;
    troop.units.forEach((i, idx) => {
        for (let q = 0; q < i; q++) {
            units.push({type: idx, id: uid, name: names[idx], owner: owner})
            uid++;
        }
    })
    troop.general.forEach((i) => {
        units.push({type: 'general', id: uid, name: i});
        uid++;
    })
    return units;
}

export function canTakeDamage(G, ctx, arg) {
    let combatInfo;
    let isSong;
    if (arg.eliminated.length === 0 && arg.defeated.length === 0) {
        return false;
    } else {
        let all = arg.eliminated.concat(arg.defeated)
        if (all[0].owner === 'song') {
            isSong = true;
            combatInfo = G.combatInfo.song;
        } else {
            isSong = false;
            combatInfo = G.combatInfo.jinn;
        }
        let eliminatedEndurance, defeatedEndurance, damage, endurance;
        if (arg.eliminated.length > 0) {
            let eTroop = unitsToTroop(arg.eliminated);
            eTroop.region = combatInfo.troop.region;
            eTroop.city = combatInfo.troop.city;
            eliminatedEndurance = troopEndurance(G, ctx, eTroop);
        } else {
            eliminatedEndurance = 0;
        }
        if (arg.defeated.length > 0) {
            let dTroop = unitsToTroop(arg.defeated);
            dTroop.region = combatInfo.troop.region;
            dTroop.city = combatInfo.troop.city;
            defeatedEndurance = troopEndurance(G, ctx, unitsToTroop(arg.defeated));
        } else {
            defeatedEndurance = 0;
        }
        endurance = troopEndurance(G, ctx, combatInfo.troop);
        damage = combatInfo.pendingDamage
        damage = damage > endurance ? endurance : damage;
        if (!isSong && G.combatInfo.isSiege && G.combatInfo.jinn.isAttacker && G.combatInfo.jinn.troop.units[4] > 0) {
            if (eliminatedEndurance + defeatedEndurance >= damage) {
                let count = arg.eliminated.length + arg.defeated.length
                return count < 3 || eliminatedEndurance >= defeatedEndurance;
            } else {
                return false;
            }
        } else {
            return (eliminatedEndurance + defeatedEndurance >= damage && eliminatedEndurance >= defeatedEndurance);
        }
    }
}
