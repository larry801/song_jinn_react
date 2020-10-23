import React from "react";
import Paper from "@material-ui/core/Paper";
import {troopToString} from "../auto/util";
import {Grid} from "@material-ui/core";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import {getRegionById, mountainPasses} from "../constants/regions";
import {getCityByID} from "../constants/cities";

export function CombatPanel(props) {

    const info = props.G.combatInfo

    const battleType = () => {
        if (info.isSiege) return "攻城"
        if (info.isRescue) return "解围"
        if (info.isBreakthrough) return "突围"
        if (info.isField) return "野战"
    }
    const types = {
        "combatCard":"运筹",
        "takeDamageRange":"远程受创",
        "takeDamageStationedArcherRangeFirst":"驻队矢远程受创",
        "range":"远程",
        "takeDamageMelee":"交锋受创",
        "melee":"交锋",
        "takeDamageWuLin":"吴璘受创",
        "wuLin":"吴璘",
        "beatGong":"鸣金",
    }

    const stage = types[info.stage];

    const region = () =>{
        let atk = info.song.isAttacker ? info.song : info.jinn;
        let def = info.song.isAttacker ? info.jinn : info.song;
        if(info.mountainPass !==0){
            return mountainPasses[info.mountainPass].name
        }
        if(info.isSiege){
            return getCityByID(def.troop.city).name
        }
        if(info.isBreakthrough){
            return getCityByID(def.troop.region).name
        }
        if(info.isRescue){
            return getCityByID(def.troop.city).name
        }
        if(info.isField){
            return getRegionById(atk.troop.region).name;
        }
    }

    return info.pendingCombat ? <div>
        <Grid container>
            <Grid item>
                <div><label>{region()} {battleType()} 第{info.isRoundTwo ? 2 : 1}轮 {stage}阶段 </label></div>
            </Grid>

            <Grid item>
                <Paper>
                    <label>宋{info.song.isAttacker ? "攻" : "守"}</label>
                    {info.song.combatCards.length !== 0 ?
                        <label>战斗牌：{info.song.combatCards.map((id) => getSongCardById(id).name)}</label> : ""}
                    <label>军团：{troopToString(info.song.troop)}</label>
                    <label>骰子：{info.song.dices.toString()}</label>
                    <label>未承受伤害：{info.song.pendingDamage}</label>
                </Paper>
            </Grid>
            <Grid item>
                <Paper>
                    <label>金{info.jinn.isAttacker ? "攻" : "守"}</label>
                    {info.jinn.combatCards.length !== 0 ?
                        <label>战斗牌：{info.jinn.combatCards.map((id) => getJinnCardById(id).name)}</label> : ""}
                    <label>军团：{troopToString(info.jinn.troop)}</label>
                    <label>骰子：{info.jinn.dices.toString()}</label>
                    <label>未承受伤害：{info.jinn.pendingDamage}</label>
                </Paper>
            </Grid>
        </Grid>
    </div> : ""
}
