import React from 'react';
import {makeStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepContent from '@material-ui/core/StepContent';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Dialog from "@material-ui/core/Dialog";
import {TakeDamageTroopList, TransferTroopList} from "./march";
import {troopEndurance, troopToUnits, unitsToString} from "../../auto/util";
import DialogTitle from "@material-ui/core/DialogTitle";

const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
    },
    button: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
    },
    actionsContainer: {
        marginBottom: theme.spacing(2),
    },
    resetContainer: {
        padding: theme.spacing(3),
    },
}));

function getSteps() {
    return ['选择受创部队', '选择被消灭部队'];
}


export const TakeDamageStepper = ({G, ctx, moves, events, log, isActive, playerID }) =>{

    const [troop,setTroop] = React.useState([])
    const [e,setE] = React.useState([])
    const [d,setD] = React.useState([])

    function getStepContent(step) {
        switch (step) {
            case 0:
                return <TransferTroopList
                    leftTroop={info.troop}
                />;
            case 1:
                return <TransferTroopList
                    leftTroop={troop}
                />;
            case 2:
                return `死 ${unitsToString(e)} 溃 ${unitsToString(d)}`;
            default:
                return 'Unknown step';
        }
    }
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

    const info = G.songPlayer === playerID ? G.combatInfo.song: G.combatInfo.jinn;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    return (
        <div className={classes.root}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((label, index) => (
                    <Step key={label}>
                        <StepLabel>{label}</StepLabel>
                        <StepContent>
                            <Typography>{getStepContent(index)}</Typography>

                            <div className={classes.actionsContainer}>
                                <div>
                                    <Button
                                        disabled={activeStep === 0}
                                        onClick={handleBack}
                                        className={classes.button}
                                    >
                                        上一步
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                        className={classes.button}
                                    >
                                        {activeStep === steps.length - 1 ? '完成' : '下一步'}
                                    </Button>
                                </div>
                            </div>
                        </StepContent>
                    </Step>
                ))}
            </Stepper>
            {activeStep === steps.length && (
                <Paper square elevation={0} className={classes.resetContainer}>
                    <Typography>All steps completed - you&apos;re finished</Typography>
                    <Button onClick={handleReset} className={classes.button}>
                        确定
                    </Button>
                </Paper>
            )}
        </div>
    );
}

export function TakeDamageModal({G,ctx,playerID,moves,isActive}) {
    const [open, setOpen] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };
    const info = G.songPlayer === playerID?G.combatInfo.song:G.combatInfo.jinn

    const callback = (arg) => {
        moves.takeDamage(arg)
    }

    const endurance = troopEndurance(G,ctx,info.troop);
    const realDamage = info.pendingDamage>endurance?endurance:info.pendingDamage;
    return <div>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            受创
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <DialogTitle>承受伤害：{realDamage}</DialogTitle>
            <TakeDamageTroopList
                damage = {realDamage}
                units={troopToUnits({...info.troop,general:[]})}
                callback={callback}
                G={G} ctx={ctx} playerID={playerID}
            />
        </Dialog>
    </div>
}

