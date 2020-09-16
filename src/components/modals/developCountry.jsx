import React from 'react'
import Dialog from "@material-ui/core/Dialog";
import {Button} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import {curPub} from "../../auto/util";

export function DevelopCountryModal(props){

    const pub = curPub(props.G,props.ctx);

        return <Dialog open={true}>
            <Typography>内政</Typography>
            <Button onClick={()=>{}} >-</Button>
            {pub.civil}
            <Button>+</Button>
            <Typography>军事 拥立 殖民 政策</Typography>
        </Dialog>
}
