import React from "react";
import {Button} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import {
    accumulator,
    jinnCitySupply,
    jinnSupplementCities,
    songCitySupply,
    songSupplementCities
} from "../../auto/util";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Accordion from "@material-ui/core/Accordion";
import {getCityByID} from "../../constants/cities";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {UNIT_SHORTHAND} from "../../constants/general";
import Typography from "@material-ui/core/Typography";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";

export const Reinforcement = ({G, ctx, playerID, moves}) => {
    const isSong = playerID === G.songPlayer;
    const supplementBank = isSong ? G.song.supplementBank : G.jinn.supplementBank;
    const unitsBank = isSong ? G.song.supplementBank.slice(0, 6) : G.jinn.supplementBank.slice(0, 7);
    const cities = isSong ? songSupplementCities(G, ctx) : jinnSupplementCities(G, ctx,);
    const getSup = isSong ? songCitySupply : jinnCitySupply;
    const [open, setOpen] = React.useState(true);
    const [expanded, setExpanded] = React.useState(0);
    const emptyTroop = isSong ? [0, 0, 0, 0, 0, 0] : [0, 0, 0, 0, 0, 0, 0,];
    const [results, setResults] = React.useState(
        cities.map(id => {
                return {
                    id: id,
                    troop: {
                        units: emptyTroop,
                        general: [],
                    }
                }
            }
        )
    )
    const remain = unitsBank.map((i, idx) => {
        let remainUnit = i;
        for (let r of results) {
            remainUnit -= r.troop.units[idx];
        }
        return remainUnit;
    })

    const changeGeneral = (name,id)=>{
        let newResults = [...results];
        for (let r of newResults) {
            if (r.id === id) {
                if (r.troop.general.includes(name)) {
                    r.troop.general.splice(r.troop.general.indexOf(name));
                } else {
                    r.troop.general.push(name);
                }
            }else{
                if (r.troop.general.includes(name)) {
                    r.troop.general.splice(r.troop.general.indexOf(name));
                }
            }
        }
        setResults(newResults)
    }

    const dispatch = (action) => {
        let newResults = [...results];
        for (let r of newResults) {
            if (r.id === action.id) {
                if (action.type === "increment") {
                    r.troop.units[action.uid]++;
                } else {
                    r.troop.units[action.uid]--;
                }
            }
        }
        setResults(newResults)
    }

    return <>
        <Button onClick={() => setOpen(true)}>补充</Button>
        <Dialog open={open}>
            <Button onClick={() => moves.reinforcement(results)}
                disabled={remain.reduce(accumulator)>0}
            >确定</Button>

            {results.map(res => <Accordion expanded={expanded === res.id} onChange={() => setExpanded(res.id)}
                                           key={res.id}>
                    <AccordionSummary id={res.id}>
                        {getCityByID(res.id)["name"]} 可补充{getSup(G, ctx, res.id)}个部队
                    </AccordionSummary>
                    <AccordionDetails>
                        {supplementBank.slice(0, -1).map((i, uid) => {
                            if (i === 0) return ""
                            else return <>
                            <Typography>{UNIT_SHORTHAND[playerID][uid]}:</Typography>
                            <Button onClick={() => dispatch({type: "increment", id: res.id, uid: uid})}
                                    disabled={res.troop.units[uid] === 0}
                            >
                                -</Button>
                            res.troop.units[uid]
                            <Button
                                onClick={() => dispatch({type: "increment", id: res.id, uid: uid})}
                            disabled={
                                    remain[uid] === 0 || res.troop.units.reduce(accumulator) >= getSup(G, ctx, res.id)
                                }
                            >+
                            </Button>
                        </>
                        })}
                        {supplementBank.slice(-1).map((name,id)=><FormControlLabel
                            key={id} id={id}
                            control={<Checkbox
                                checked={res.troop.general.includes(name)}
                                onChange={()=>{changeGeneral(name,res.id)}}
                                name={name}/>}
                            label={name}
                        />)}
                    </AccordionDetails>
                </Accordion>
            )}
        </Dialog>
    </>
}
