import React, {Component } from 'react'
import {troopToString} from "../auto/util";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import {getCityByID} from "../constants/cities";
import {getRegionById} from "../constants/regions";
import Grid from "@material-ui/core/Grid";
import {Typography} from "@material-ui/core";

export class TroopList extends Component{

    render() {
        const isSong = this.props.playerID === '0';
        let troops = [];
        if (isSong) {
            troops = this.props.G.pub.song.troops;
        } else {
            troops = this.props.G.pub.jinn.troops;
        }


        return <Grid container>
            {troops.map((troop)=>{
                // TODO 断补警告
                return <Paper key={troops.indexOf(troop)}>
                    <Typography>{getRegionById(troop.region).name}</Typography>
                    <Typography>{getCityByID(troop.city).name}</Typography>
                    <Button
                        variant="outlined"
                        disabled={false}
                        onClick={()=>{this.props.callback(troop)}}
                >{troopToString(troop)}</Button>
                </Paper>
            })}
        </Grid>
    }
}
