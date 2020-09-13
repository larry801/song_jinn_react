import React from "react";
import Card from "@material-ui/core/Card";
import CardHeader from "@material-ui/core/CardHeader";
import Checkbox from "@material-ui/core/Checkbox";
import Divider from "@material-ui/core/Divider";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Grid from "@material-ui/core/Grid";
import {makeStyles} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import {troopEndurance, troopToString} from "../../auto/util";
import {unitsToTroop} from "./moveArmy";
import {canTakeDamage} from "./takeDamage";

const useStyles = makeStyles((theme) => ({
    root: {
        margin: 'auto',
    },
    cardHeader: {
        padding: theme.spacing(1, 2),
    },
    list: {
        backgroundColor: theme.palette.background.paper,
        overflow: 'auto',
    },
    button: {
        margin: theme.spacing(0.5, 0),
    },
}));

function not(a, b) {
    return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
    return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
    return [...a, ...not(b, a)];
}


export function TakeDamageTroopList(props){
    const classes = useStyles();
    const [eliminated,setEliminated] = React.useState([])
    const [defeated,setDefeated] = React.useState([])
    const handleEliminate = (value) => () => {
        const eliminatedIndex = eliminated.indexOf(value)
        const defeatedIndex = defeated.indexOf(value)
        const newEliminated = [...eliminated]
        const newDefeated = [...defeated]
        if(defeatedIndex!==-1){
            newDefeated.splice(defeatedIndex,1);
            setDefeated(newDefeated);
        }
        if(eliminatedIndex === -1){
            newEliminated.push(value)
        }else{
            newEliminated.splice(eliminatedIndex,1);
        }
        setEliminated(newEliminated);
    }

    const handleDefeated = (value) => () =>{
        const eliminatedIndex = eliminated.indexOf(value)
        const defeatedIndex = defeated.indexOf(value)
        const newEliminated = [...eliminated]
        const newDefeated = [...defeated]
        if(eliminatedIndex!==-1){
            newEliminated.splice(eliminatedIndex,1);
            setEliminated(newEliminated);
        }
        if(defeatedIndex === -1){
            newDefeated.push(value)
        }else{
            newDefeated.splice(defeatedIndex,1);
        }
        setDefeated(newDefeated);
    }

    const arg = {
        eliminated: eliminated,
        defeated: defeated,
    }

    const t = (arg) => canTakeDamage(props.G,props.ctx,arg)

    // TODO 多受创问题
    const removeOneUnitCanProceed = false;

    const canProceed = t(arg)

    const takeDamageList = (title, items, change) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                title={title}
                subheader={troopToString(unitsToTroop(items))}
            />
            <Divider/>
            <List className={classes.list} dense component="div" role="list">
                {props.units.map((value) => {
                    const labelId = `transfer-list-all-item-${value.id}-label`;
                    return (
                        <ListItem key={value.id}
                                  role="listitem"
                                  button onClick={change(value)}
                                  disabled={!items.includes(value) && canProceed}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={items.includes(value)}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{'aria-labelledby': labelId}}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value.name}/>
                        </ListItem>
                    );
                })}
                <ListItem/>
            </List>
        </Card>
    );

    return <>
        <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
            <Grid item>{takeDamageList('消灭', eliminated,handleEliminate)}</Grid>
            <Grid item>{takeDamageList('击溃', defeated,handleDefeated)}</Grid>
            <Grid item><Button variant={"outlined"}
           disabled={!canProceed}
                onClick={()=>props.callback(arg)}
            >确定</Button></Grid>
        </Grid>
    </>
}

export function TransferTroopList(props){
    const classes = useStyles();

    const [checked, setChecked] = React.useState([]);
    const [left, setLeft] = React.useState(props.left);
    const [right, setRight] = React.useState([]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const numberOfChecked = (items) => intersection(checked, items).length;

    const handleToggleAll = (items) => () => {
        if (numberOfChecked(items) === items.length) {
            setChecked(not(checked, items));
        } else {
            setChecked(union(checked, items));
        }
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const customList = (title, items) => (
        <Card>
            <CardHeader
                className={classes.cardHeader}
                avatar={
                    <Checkbox
                        onClick={handleToggleAll(items)}
                        checked={numberOfChecked(items) === items.length && items.length !== 0}
                        indeterminate={numberOfChecked(items) !== items.length && numberOfChecked(items) !== 0}
                        disabled={items.length === 0}
                        inputProps={{'aria-label': '全部已选中'}}
                    />
                }
                title={title}
                subheader={`${numberOfChecked(items)}/${items.length} 已选中`}
            />
            <Divider/>
            <List className={classes.list} dense component="div" role="list">
                {items.map((value) => {
                    const labelId = `transfer-list-all-item-${value}-label`;
                    return (
                        <ListItem key={items.indexOf(value)} role="listitem" button onClick={handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    checked={checked.indexOf(value) !== -1}
                                    tabIndex={-1}
                                    disableRipple
                                    inputProps={{'aria-labelledby': labelId}}
                                />
                            </ListItemIcon>
                            <ListItemText id={labelId} primary={value.name}/>
                        </ListItem>
                    );
                })}
                <ListItem/>
            </List>
        </Card>
    );

    return (<>
            <Grid container spacing={2} justify="center" alignItems="center" className={classes.root}>
            <Grid item>{customList('原军团', left)}</Grid>
            <Grid item>
                <Grid container direction="column" alignItems="center">
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedRight}
                        disabled={leftChecked.length === 0}
                        aria-label="移动选中项目到右边"
                    >
                        &gt;
                    </Button>
                    <Button
                        variant="outlined"
                        size="small"
                        className={classes.button}
                        onClick={handleCheckedLeft}
                        disabled={rightChecked.length === 0}
                        aria-label="移动选中项目到左边"
                    >
                        &lt;
                    </Button>
                </Grid>
            </Grid>
            <Grid item>{customList('目标', right)}</Grid>
        </Grid>
    <Button
        variant="outlined"
        disabled={right.length === 0}
        onClick={()=>props.dispatch({
        type:'targetTroop',
        payload:right
    })}>下一步</Button>
    </>
);
}
