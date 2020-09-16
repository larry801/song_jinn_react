import React from "react";
import {Typography} from "@material-ui/core";
import Button from "@material-ui/core/Button";
import {getJinnCardById, getSongCardById} from "../../constants/cards";

export const SettleDevelop = ({G, ctx, events, moves, log, playerID}) => {

    const isSong = playerID === G.songPlayer;
    const p = isSong ? G.song : G.jinn
    const special = isSong ? G.song.policy : G.jinn.colonization

    const [military, setMilitary] = React.useState(p.military)
    const [civil, setCivil] = React.useState(p.civil)
    const [sp, setSp] = React.useState(special)

    const points = () => {
        let points = 0;
        let cards = [...p.developCards];
        if (!isSong) {
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

    const specialCost = () => {
        if (isSong) {
            return 3 * Math.abs(p.policy - sp);
        } else {
            let cost = 0;
            for (let c = p.colonization + 1; c <= sp; c++) cost += (2 * c);
            return cost;
        }
    }

    const cost = () => {
        let cost = 0;
        for (let m = p.military + 1; m <= military; m++) cost += m;
        for (let c = p.civil; c <= civil; c++) cost += c;
        return cost + specialCost();
    };

    const NanNanBeiBei = p.developCards.includes(40) ? points() - sp * 2 >= specialCost() : true;

    const remain = points() - cost();

    const submit = () => {
        moves.resultOfDevelopment({
            military: military,
            civil: civil,
            special: sp,
        })
    }

    return <>
        <Typography>使用{points()}点进行发展 剩余{remain} 点</Typography>
        <label>军事</label>
        <Button
            disabled={military === p.military}
            onClick={() => setMilitary(military - 1)}>-</Button>
        {military}<Button
        disabled={remain < military}
        onClick={() => setMilitary(military + 1)}>-</Button>
        <label>内政</label>
        <Button
            disabled={civil === p.civil}
            onClick={() => setCivil(civil - 1)}
        >-</Button>
        {civil}<Button
        disabled={remain < civil}
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
                        disabled={remain < sp * 2 + 2}
                >+</Button>
            </div>
            :
            <div><label>政策</label>
                <Button
                    disabled={remain < 3}
                    onClick={() => setSp(sp - 1)}
                >-</Button>
                {sp}
                <Button onClick={() => setSp(sp + 1)}
                        disabled={remain < 3}
                >+</Button></div>}
        <Button
            disabled={!(remain > 0 && NanNanBeiBei)}
            onClick={() => submit()}>确定</Button>
    </>
}
