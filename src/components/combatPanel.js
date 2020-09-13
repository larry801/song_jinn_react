import React from "react";
import Paper from "@material-ui/core/Paper";
import {troopToString} from "../auto/util";
import {Grid} from "@material-ui/core";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import {getRegionById} from "../constants/regions";

export function CombatPanel(props){

    const info = props.G.combatInfo

    const stage = ""

    const battleType = ""

    return info.pendingCombat ? <div>
        <Grid container>
            <Grid item>
                <div><label>{}{battleType}{stage}</label></div>
                <div><label></label></div>

            </Grid>

            <Grid item>
            <Paper>
                <label>宋{info.song.isAttacker?"攻":"守"}</label>
                {info.song.combatCards.length !==0 ?<label>战斗牌：{info.song.combatCards.map((id)=>getSongCardById(id).name)}</label>:""}
                <label>军团：{troopToString(info.song.troop)}</label>
                <label>骰子：{info.song.dices.toString()}</label>
                <label>未承受伤害：{info.song.pendingDamage}</label>
            </Paper>
            </Grid>
            <Grid item>
                <Paper>
                    <label>金{info.jinn.isAttacker?"攻":"守"}</label>
                    {info.jinn.combatCards.length!==0?<label>战斗牌：{info.jinn.combatCards.map((id)=>getJinnCardById(id).name)}</label>:""}
                    <label>军团：{troopToString(info.jinn.troop)}</label>
                    <label>骰子：{info.jinn.dices.toString()}</label>
                    <label>未承受伤害：{info.jinn.pendingDamage}</label>
                </Paper>
            </Grid>
        </Grid>
    </div>:""
}
