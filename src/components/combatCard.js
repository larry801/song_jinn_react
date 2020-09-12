import React from "react";
import {Dialog, FormLabel} from "@material-ui/core";
import {getJinnCardById, getSongCardById} from "../constants/cards";
import Button from "@material-ui/core/Button";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
//import Tooltip from "@material-ui/core/Tooltip";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
//import {curPlayerInStage} from "../auto/util";

export function CombatCard(props){
    //const shown = curPlayerInStage(props.ctx,'combatCard') && props.isActive;
    const shown = props.G.combatInfo.stage ==='combatCard' && props.isActive;
    const chosen = props.G.songPlayer === props.playerID ? props.G.pub.song.combatCardChosen : props.G.pub.jinn.combatCardChosen
    const [open,setOpen] = React.useState(true);
    const card = props.playerID === '0'? getSongCardById: getJinnCardById;
    const helperText = () =>{
        if(noCombatCard) {
            return "无法选择战斗牌 请跳过"
        }else{
            return "请选择战斗牌"
        }
    }
    const [state, setState] = React.useState(
        props.G.player[props.ctx.currentPlayer].hands.filter((id)=>card(id).combat).map((id)=>{
            return {
                name:card(id).name,
                id:id,
                desc:card(id).desc,
                checked:false,
                pre:card(id).pre,
            }
        })
    );

    const noCombatCard = state.length === 0;

    const handleChange = (event) => {
        let newState = state.map(p=>{
            if (p.name === event.target.name){
                p.checked = !p.checked;
            }
            return p;
        })
        setState(newState);
    };

    return (shown && !chosen) ?
            <><Button variant={"outlined"} onClick={()=>setOpen(true)}>
        战斗牌
    </Button><Dialog open={open} onClose={()=>setOpen(false)}>
        <FormControl required component="fieldset">
            <FormLabel component="legend">{helperText()}</FormLabel>
            <FormGroup>
                {state.map((p)=>
                        <FormControlLabel disabled={!p.pre(props.G,props.ctx)} key={p.id} id={p.id}
                                          control={<Checkbox checked={p.checked} onChange={handleChange} name={p.name} />}
                                          label={p.name}
                        />
)}
        {noCombatCard?<Button
            onClick={()=>{
                props.moves.combatCard([],props.playerID)
            }}
        >跳过</Button>:<Button
                onClick={() => {
                    props.moves.combatCard(
                        state.filter( v => v.checked)
                            .map(v => v.id),props.playerID
                    )}}
        >确定</Button>}
            </FormGroup>
        </FormControl>
    </Dialog></>:""
}
