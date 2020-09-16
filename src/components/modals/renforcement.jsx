import React from "react";
import {Button} from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import {canSupplySong, jinnSupplementCities, songSupplementCities} from "../../auto/util";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import Accordion from "@material-ui/core/Accordion";
import {getCityByID} from "../../constants/cities";

export const Renforcement = ({G,ctx,playerID})=>{

    const  cities = playerID === G.songPlayer ? songSupplementCities(G,ctx):jinnSupplementCities(G,ctx,);

    const [open,setOpen]=React.useState(true);
    const [expanded,setExpanded]=React.useState(0);

    return <>
    <Button onClick={()=>setOpen(false)} >补充</Button>
        <Dialog open={open}>
            {cities.map(id=><Accordion expanded={expanded === id} onChange={() => this.expand(id)}
                           key={id}>
                    <AccordionSummary id={id}>
                        {getCityByID(id)["name"]} {}
                    </AccordionSummary>
                </Accordion>
            )}
        </Dialog>
    </>
}
