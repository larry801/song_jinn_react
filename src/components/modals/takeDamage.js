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
import {TakeDamageTroopList} from "./march";
import {troopToUnits, unitsToTroop} from "./moveArmy";
import {troopEndurance} from "../../auto/util";

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
    return ['选择承受伤害部队', '选择击溃部队'];
}

function getStepContent(step) {
    switch (step) {
        case 0:
            return `For each ad campaign that you create, you can control how much
              you're willing to spend on clicks and conversions, which networks
              and geographical locations you want your ads to show on, and more.`;
        case 1:
            return 'An ad group contains one or more ads which target a shared set of keywords.';
        case 2:
            return `Try out different ad text to see what brings in the most customers,
              and learn how to enhance your ads using features like ad extensions.
              If you run into any problems with your ads, find out how to tell if
              they're running and how to resolve approval issues.`;
        default:
            return 'Unknown step';
    }
}

export default function VerticalLinearStepper() {
    const classes = useStyles();
    const [activeStep, setActiveStep] = React.useState(0);
    const steps = getSteps();

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
                                        Back
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleNext}
                                        className={classes.button}
                                    >
                                        {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
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
                        Reset
                    </Button>
                </Paper>
            )}
        </div>
    );
}

export function TakeDamageModal(props) {
    const [open, setOpen] = React.useState(true);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const info = ()=>{
        if(props.G.songPlayer === props.playerID){
            return props.G.combatInfo.song
        }else{
            return props.G.combatInfo.jinn
        }
    }

    const callback = (eliminated, defeated) => {
        props.moves.takeDamage({
            eliminated: eliminated,
            defeated: defeated,
        })
    }

    return <div>
        <Button variant="outlined" color="primary" onClick={handleClickOpen}>
            受创
        </Button>
        <Dialog open={open} onClose={() => setOpen(false)}>
            <TakeDamageTroopList
                units={troopToUnits(info.troop)}
                callback={callback}
                G={props.G} ctx={props.ctx} playerID={props.playerID}
            />
        </Dialog>
    </div>
}

export function canTakeDamage(G, ctx, arg) {
    let combatInfo;
    let isSong;
    if (arg.eliminated.length === 0 && arg.defeated.length === 0) {
        return false;
    } else {
        let all = arg.eliminated.concat(arg.defeated)
        if (all[0].owner === 'song') {
            isSong = true;
            combatInfo = G.combatInfo.song;
        } else {
            isSong = false;
            combatInfo = G.combatInfo.jinn;
        }
        let eliminatedEndurance, defeatedEndurance, damage, endurance;
        eliminatedEndurance = troopEndurance(unitsToTroop(arg.eliminated));
        defeatedEndurance = troopEndurance(unitsToTroop(arg.defeated));
        endurance =  troopEndurance(combatInfo.troop);
        damage =  combatInfo.pendingDamage
        damage = damage > endurance ? endurance : damage;
        if (!isSong && G.combatInfo.isSiege && G.combatInfo.jinn.isAttacker && G.combatInfo.jinn.troop.units[4] > 0) {
            if (eliminatedEndurance + defeatedEndurance >= damage) {
                let count = arg.eliminated.length + arg.defeated.length
                return count < 3 || eliminatedEndurance >= defeatedEndurance;
            } else {
                return false;
            }
        } else {
            return eliminatedEndurance + defeatedEndurance >= damage
                && eliminatedEndurance >= defeatedEndurance;
        }
    }
}
