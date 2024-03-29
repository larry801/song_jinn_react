import React, {useState} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import {TroopList} from "../troopList";
import Dialog from "@material-ui/core/Dialog";
import {Typography} from "@material-ui/core";
import {
    getMarchDestination,
    jinnTroopInCity,
    jinnTroopInRegion,
    songTroopInCity,
    songTroopInRegion,
    stackLimitReached,
    troopIsArmy,
    troopToString,
    troopToUnits,
    unitsToTroop
} from "../../auto/util";
import {getRegionById} from "../../constants/regions";
import {getCityByID} from "../../constants/cities";
import {TransferUnitsList} from "./march";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Tooltip from "@material-ui/core/Tooltip";
import Grid from "@material-ui/core/Grid";
import FormHelperText from "@material-ui/core/FormHelperText";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        width: 200,
        height: 230,
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

export function March(props) {
    const classes = useStyles();
    const [open, setOpen] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const [arg, setArg] = React.useState({
        src: {
            units: [0, 0, 0, 0, 0, 0, 0],
            general: [],
            region: 0,
            city: 0,
        },
        dst: 0,
        new: {
            units: [0, 0, 0, 0, 0, 0, 0],
            general: [],
            region: 0,
            city: 0,
        },
        all: false,
    })
    const [state, setState] = React.useState({step: 0})
    const setSource = (troop) => {
        setState({step: 1})
        setArg({...arg, src: troop})
    }
    const stepText = [
        "请选择进军军团",
        "请选择军团成员",
        "请选择进军目的地",
        "请确认",
        "请选择行军方式",
    ][state.step]


    const setDst = (dst) => {
        setState({step: 3});
        setArg({...arg, dst: dst});
    }

    const marchReducer = (action) => {
        switch (action.type) {
            case 'targetTroop':
                setState({step: 2});
                if (action.payload.length === troopToUnits(arg.src).length) {
                    setArg({...arg, all: true});
                } else {
                    setArg({...arg, new: unitsToTroop(action.payload)});
                }
                break;
            default:
                throw Error();
        }
    }

    const troopList = <TroopList
        G={props.G} ctx={props.ctx} moves={props.moves} playerID={props.playerID} isActive={props.isActive}
        callback={setSource}
    />

        const transferList =<>
            <Button variant="outlined" onClick={()=>{
            setArg({...arg, all: true});
            setState({step: 2});
        }}>全军进军</Button>
            <Button onClick={() => setState({step:0})}>上一步</Button>
            <TransferUnitsList
                leftUnits={troopToUnits(arg.src)}
                dispatch={marchReducer}/>
        </>
        const [region, setRegion] = useState(0);
    const destinationHelperText = (region) =>{
        let G = props.G;
        let ctx = props.ctx;
        let hasCity = getRegionById(region).hasCity;
        let city = getRegionById(region).cityID;
        if(region===0){
            return "请选择"
        }else{
            let jinn = jinnTroopInRegion(props.G,props.ctx,region);
            let song = songTroopInRegion(props.G,props.ctx,region);
            if (props.playerID === props.G.songPlayer){
                // TODO 渡河消灭部队
                if(jinn!==false){
                    if(song!==false){
                        if(troopIsArmy(props.G,props.ctx,jinn)){
                            return "两军对峙 进军触发会战"
                        }else{
                            return "直接消灭敌方非军团部队"
                        }
                    }else{
                        if(troopIsArmy(props.G,props.ctx,jinn)){
                            if(hasCity){
                                if (songTroopInCity(G, ctx, city)) {
                                    return "解围"
                                }else{
                                    return "攻城"
                                }
                            }else{
                                return "野战"
                            }
                        }else{
                            return "直接消灭敌方非军团部队"
                        }
                    }
                }else{
                    if(song!==false){
                        if(stackLimitReached(props.G,props.ctx,arg,region)){
                            return "超编"
                        }else{
                            return "合兵"
                        }
                    }else{
                        return "直接移动"
                    }
                }


            }else{
                if(jinn!==false){
                    if(song!==false){
                        if(troopIsArmy(props.G,props.ctx,song)){
                            return "两军对峙 进军触发会战"
                        }else{
                            return "直接消灭敌方非军团部队"
                        }
                    }else{
                        if(stackLimitReached(props.G,props.ctx,arg,region)){
                            return "超编"
                        }else{
                            return "合兵"
                        }
                    }
                }else{
                    if(song!==false){
                        if(troopIsArmy(props.G,props.ctx,jinn)){
                            if (hasCity) {
                                if (jinnTroopInCity(G, ctx, city)) {
                                    return "解围"
                                }else{
                                    return "攻城"
                                }
                            }else{
                                return "野战"
                            }
                        }else{
                            return "直接消灭敌方非军团部队"
                        }
                    }else{
                        return "直接移动"
                    }
                }
            }

        }
    }
        const regionsList =
            <FormControl required error={false} component="fieldset" className={classes.formControl}>
                <FormGroup>
                    <Button variant="outlined" onClick={() => setState({step:1})}>上一步</Button>
                    <RadioGroup aria-label="进军目的地" name="order" value={region}
                                onChange={(e) => setRegion(parseInt(e.target.value))}>
                        <Grid container>
                        {getMarchDestination(props.G, props.ctx, arg.src.region).map((id) =>
                            <Grid item key={id}>
                            <FormControlLabel key={id} value={id}
                                              control={<Radio/>}
                                              label={getRegionById(id).name}
                            /></Grid>

                        )}
                        </Grid>

                    </RadioGroup>
                    <Button variant="outlined" onClick={() => setDst(region)}>下一步</Button>
                </FormGroup>
            </FormControl>


        const result = <div>
            <Typography>
                {troopToString(arg.new)}{arg.new.general.map((g)=>g)}
                {arg.all ?  `${troopToString(arg.src)}${arg.src.general.map((g)=>g)}全军`:""}从
                {getRegionById(arg.src.region).name}
                {/* TODO 行军方式 */}
                {getCityByID(arg.src.city).name}移动到
                {getRegionById(arg.dst).name}
            </Typography>
        </div>

        return<div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                进军
            </Button>
            <Dialog open={open} onClose={()=>setOpen(false)}>
            <Typography variant="h5" >{stepText + " " +destinationHelperText(region)}</Typography>
            {state.step === 0 ? troopList : ''}
            {state.step === 1 ? transferList : ''}
            {state.step === 2 ? regionsList : ''}
            {state.step === 3 ? result : ''}
            {state.step === 3 ? <Button variant="outlined" hidden={state.step !== 3} onClick={() => {
                props.moves.march(arg);
                setState({step: 1});
                setArg({
                    src: {
                        units: [0, 0, 0, 0, 0, 0, 0],
                        general: [],
                        region: 0,
                        city: 0,
                    },
                    dst: 0,
                    new: {
                        units: [0, 0, 0, 0, 0, 0, 0],
                        general: [],
                        region: 0,
                        city: 0,
                    },
                    all: false,
                });
            }}>确认</Button>:""}
        </Dialog>
        </div>
}

