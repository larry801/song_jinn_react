import React from "react";
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import {makeStyles} from '@material-ui/core/styles';
import FormLabel from '@material-ui/core/FormLabel';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import {curPub} from "../../auto/util";
import {canChoosePlan, getPlanByID} from "../../constants/plan";
import Tooltip from "@material-ui/core/Tooltip";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing(3),
    },
}));


export default function ChoosePlanModal(props){

    const classes = useStyles();
    const [state, setState] = React.useState(
        props.G.player[props.ctx.currentPlayer].availablePlans.map((id)=>{
            return {
                name:getPlanByID(id).name,
                id:id,
                desc:getPlanByID(id).desc,
                checked:false,
            }
        })
    );

    const handleChange = (event) => {
        let newState = state.map(p=>{
            if (p.name === event.target.name){
                p.checked = !p.checked;
            }
            return p;
        })
        setState(newState);
    };

    const planLimit = () =>{
        if (curPub(props.G,props.ctx).lastTurnPlans.includes(21)){
            return 2;
        }else{
            return 1;
        }
    }

    const error = state.filter(v => v.checked).length > planLimit() || state.filter(v => v.checked).length === 0;

    const noPlanToChoose = state.filter(v => canChoosePlan(props.G,props.ctx,v.id,props.ctx.currentPlayer)).length === 0;

    const helperText = () =>{
        if(noPlanToChoose) return "无法选择作战计划 请跳过"
        if(planLimit()===2){
            return "可以选择2张作战计划"
        }else{
            if(planLimit() === 1)
                return "请选择1张作战计划"
        }
    }

    return<Dialog onClose={()=>{}} open={true}>
            <FormControl required error={error} component="fieldset" className={classes.formControl}>
                <FormLabel component="legend">{helperText()}</FormLabel>
                <FormGroup >
                    {state.map((p)=>
                        <Tooltip title={p.desc} key={p.id} leaveDelay={50}>
                        <FormControlLabel disabled={!canChoosePlan(props.G,props.ctx,p.id,props.ctx.currentPlayer)} key={p.id} id={p.id}
                            control={<Checkbox checked={p.checked} onChange={handleChange} name={p.name} />}
                            label={p.name}
                        />
                        </Tooltip>)}
                </FormGroup>
            </FormControl>
            <Button hidden={noPlanToChoose} disabled={error} onClick={() => {
                props.moves.chooseStrategicPlans(
                    state.filter( v => v.checked)
                    .map(v => v.id)
                )
            }}>确认
            </Button>
        <Button hidden={!noPlanToChoose} onClick={() => {
            props.moves.chooseStrategicPlans([])
        }}>跳过
        </Button>
        </Dialog>


}
