import React from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {getJinnCardById, getSongCardById} from "../../constants/cards";

export const SettleDevelop = ({G, ctx, events, moves, log, playerID}) => {

    const p = playerID === G.songPlayer ? G.song : G.jinn
    const special = playerID === G.songPlayer ? G.song.policy : G.jinn.colonization

    const [military, setMilitary] = React.useState(p.military)
    const [civil, setCivil] = React.useState(p.civil)
    const [sp, setSp] = React.useState(special)

    const points = () => {
        let points = 0;
        let cards = [...p.developCards];
        if (playerID === G.jinnPlayer) {
            if (p.developCards.includes(40)) {
                cards.splice(cards.indexOf(40), 1)
                points += sp * 2;
            }
            cards.forEach(
                (i,) => {
                    points += getJinnCardById(i).op;
                })
        } else {
            if (cards.includes(27) && !G.jinn.activeEvents.includes(17)) {
                points++;
            }
            cards.forEach((i,) => {
                points += getSongCardById(i).op;
            })
        }
        if (p.lastTurnPlans.includes(14)) points += 4;
        return points;
    }

    const cost = 0;

    const submit = () => {
        moves.resultOfDevelopment({
            military: military,
            civil: civil,
            special: sp,
        })
    }

    return <>
        <Typography>使用{points()}点进行发展 剩余{points() - cost} 点</Typography>
        <label>军事</label>
        <Button
            disabled={military === p.military}
            onClick={() => setMilitary(military - 1)}>-</Button>
        {military}<Button
        disabled={points - cost > military}
        onClick={() => setMilitary(military + 1)}>-</Button>
        <label>内政</label>
        <Button
            disabled={civil === p.civil}
            onClick={() => setCivil(civil - 1)}
        >-</Button>
        {civil}<Button
        disabled={points - cost > civil}
        onClick={() => setMilitary(military + 1)}>-</Button>
        {civil}
        {playerID === G.jinnPlayer ?
            <div><label>殖民</label>
                <Button
                    disabled={special === sp}
                    onClick={() => setSp(sp - 1)}
                >-</Button>
                {sp}
                <Button onClick={() => setSp(sp + 1)}
                        disabled={points - cost >= sp * 2 + 2}
                >+</Button>
            </div>
            :
            <div><label>政策</label>
                <Button
                    disabled={points - cost >= 3}
                    onClick={() => setSp(sp - 1)}
                >-</Button>
                {sp}
                <Button onClick={() => setSp(sp + 1)}
                        disabled={points - cost >= 3}
                >+</Button></div>}
        <Button
            disabled={false}
            onClick={() => submit()}>确定</Button>
    </>
}
