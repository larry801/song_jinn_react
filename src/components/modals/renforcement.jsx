import React from "react";
import {Button} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import {canSupplySong, getCitySupply, jinnSupplementCities, songSupplementCities} from "../../auto/util";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Accordion from "@material-ui/core/Accordion";
import {getCityByID} from "../../constants/cities";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import {UNIT_SHORTHAND} from "../../constants/general";

export const Renforcement = ({G, ctx, playerID, moves}) => {
    const isSong = playerID === G.songPlayer;
    const supplementBank = isSong ? G.song.supplementBank : G.jinn.supplementBank;
    const cities = isSong ? songSupplementCities(G, ctx) : jinnSupplementCities(G, ctx,);

    const [open, setOpen] = React.useState(true);
    const [expanded, setExpanded] = React.useState(0);

    return <>
        <Button onClick={() => setOpen(false)}>补充</Button>
        <Dialog open={open}>
            {cities.map(id => <Accordion expanded={expanded === id} onChange={() => setExpanded(id)}
                                         key={id}>
                    <AccordionSummary id={id}>
                        {getCityByID(id)["name"]} 可补充{getCitySupply(G, ctx, id)}个部队
                    </AccordionSummary>
                    <AccordionDetails>
                        {supplementBank.slice(0,-1).map(uid=>
                            <label>{UNIT_SHORTHAND[playerID][uid]}:</label>
                        )}
                    </AccordionDetails>
                </Accordion>
            )}
        </Dialog>
    </>
}
