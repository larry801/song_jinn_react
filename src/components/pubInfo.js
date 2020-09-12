import React from "react";
import {getJinnNationalPower, getPolicy, getSongNationalPower, unitsToString} from "../auto/util";
import Paper from "@material-ui/core/Paper";
import {getPlanByID} from "../constants/plan";
import {Grid} from "@material-ui/core";

export class PubInfo extends React.Component {
    render() {
        const p = this.props.G.pub;
        let G = this.props.G;
        let ctx = this.props.ctx;
        return <Grid container><Grid item><Paper>
            <label>宋</label>
            <div><label>军事：</label>{p.song.military}</div>
            <div><label>内政：</label>{p.song.civil}</div>
            <div><label>政策：</label>{getPolicy(G, ctx)}</div>
            <div><label>国力：</label>{getSongNationalPower(G, ctx)}</div>
            <div><label>腐败：</label>{p.song.corruption}</div>
            <div><label>预备区：{unitsToString(p.song.supplementBank.slice(0, 6))}
                {p.song.supplementBank.slice(6).map((idx) => <label key={idx}>{idx}</label>)}</label></div>
            <div><label>本回合计划：{p.song.currentPlans.map(p => getPlanByID(p).name)}</label></div>
            <div><label>完成计划：{p.song.completedPlans.map(p => getPlanByID(p).name)}</label></div>
        </Paper></Grid>
            <Grid item><Paper><label>金</label>
                <div><label>军事：</label>{p.jinn.military}</div>
                <div><label>内政：</label>{p.jinn.civil}</div>
                <div><label>殖民：</label>{p.jinn.colonization}</div>
                <div><label>国力：</label>{getJinnNationalPower(G, ctx)}</div>
                <div><label>腐败：</label>{p.jinn.corruption}</div>
                <div><label>预备区：
                    {unitsToString(p.jinn.supplementBank.slice(0, 7))}
                    {p.jinn.supplementBank.slice(7).map((idx) => <label key={idx}>{idx}</label>)}</label></div>
                <div><label>本回合计划：{p.jinn.currentPlans.map(p => getPlanByID(p).name)}</label></div>
                <div><label>完成计划：{p.jinn.completedPlans.map(p => getPlanByID(p).name)}</label></div>
                {/* TODO 手牌数 弃牌 移除 */}
            </Paper></Grid>
        </Grid>
    }
}
