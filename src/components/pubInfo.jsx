import React from "react";
import {getJinnNationalPower, getPolicy, getSongNationalPower, unitsToString} from "../auto/util";
import Paper from "@material-ui/core/Paper";
import {getPlanByID} from "../constants/plan";
import {Grid} from "@material-ui/core";
import {getSongCardById} from "../constants/cards";

export class PubInfo extends React.Component {
    render() {
        let G = this.props.G;
        let ctx = this.props.ctx;
        let s=G.song;
        let j=G.jinn;
        return <Grid container><Grid item><Paper>
            <label>宋</label>
            <div><label>军事：</label>{s.military}</div>
            <div><label>内政：</label>{s.civil}</div>
            <div><label>政策：</label>{getPolicy(G, ctx)}</div>
            <div><label>国力：</label>{getSongNationalPower(G, ctx)}</div>
            <div><label>腐败：</label>{s.corruption}</div>
            <div><label>预备区：{unitsToString(s.supplementBank.slice(0, 6))}
                {s.supplementBank.slice(6).map((idx) => <label key={idx}>{idx}</label>)}</label></div>
            <div><label>本回合计划：{s.currentPlans.map(p => getPlanByID(p).name)}</label></div>
            <div><label>完成计划：{s.completedPlans.map(p => getPlanByID(p).name)}</label></div>
            <div><label>弃牌：{s.discard.map(p=>getSongCardById(p).name)}</label></div>
            <div><label>移除：{s.remove.map(p=>getSongCardById(p).name)}</label></div>
            <div><label>手牌数：</label></div>
            <div><label>发展牌：</label></div>
            <div><label>绍兴和议分数</label></div>
        </Paper></Grid>
            <Grid item><Paper><label>金</label>
                <div><label>军事：</label>{j.military}</div>
                <div><label>内政：</label>{j.civil}</div>
                <div><label>殖民：</label>{j.colonization}</div>
                <div><label>国力：</label>{getJinnNationalPower(G, ctx)}</div>
                <div><label>腐败：</label>{j.corruption}</div>
                <div><label>预备区：
                    {unitsToString(j.supplementBank.slice(0, 7))}
                    {j.supplementBank.slice(7).map((idx) => <label key={idx}>{idx}</label>)}</label></div>
                <div><label>本回合计划：{j.currentPlans.map(p => getPlanByID(p).name)}</label></div>
                <div><label>完成计划：{j.completedPlans.map(p => getPlanByID(p).name)}</label></div>
                {/* TODO 手牌数 弃牌 移除 */}
                <div><label>弃牌：{s.discard.map(p=>getSongCardById(p).name)}</label></div>
                <div><label>移除：{s.remove.map(p=>getSongCardById(p).name)}</label></div>
                <div><label>手牌数：</label></div>
                <div><label>发展牌：</label></div>
                <div><label>绍兴和议分数：</label></div>
            </Paper></Grid>
        </Grid>
    }
}
