import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Paper from '@material-ui/core/Paper';
import Draggable from 'react-draggable';
import PropTypes from 'prop-types'
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";
import FormGroup from "@material-ui/core/FormGroup";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
function PaperComponent(props) {
    return (
        <Draggable handle="#draggable-dialog-title" cancel={'[class*="MuiDialogContent-root"]'}>
            <Paper {...props} />
        </Draggable>
    );
}

export default function ChoiceDialog(props) {
    const [open, setOpen] = React.useState(true);
    const [choice, setChoice] = React.useState(props.default);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return props.show ?(
        <div>
            <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                {props.toggleText}
            </Button>
            <Dialog
                open={open}
                onClose={handleClose}
                PaperComponent={PaperComponent}
                aria-labelledby={props.title}
            >
                <DialogTitle style={{ cursor: 'move' }} id="draggable-dialog-title">
                    {props.toggleText}
                </DialogTitle>
                <DialogContent style={{ cursor: 'move' }}>
                    <FormControl required component="fieldset">
                        <FormGroup>
                            <FormLabel component="legend">{props.title}</FormLabel>
                            <RadioGroup autoFocus aria-label={props.title} name="choice" value={choice}
                                onChange={(e) => setChoice(e.target.value)}>
                                {props.choices.map((choice,idx,arr)=>
                                    !choice.hidden ?
                                    <FormControlLabel
                                        disabled={choice.disabled}
                                        key={idx} value={choice.value}
                                        control={<Radio/>}
                                        label={choice.label}/> : ""
                                )}
                            </RadioGroup>
                        </FormGroup>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={()=>{props.callback(choice)}} color="primary">
                        确认
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    ):""
}

ChoiceDialog.propTypes = {
    callback:PropTypes.func.isRequired,
    choices: PropTypes.array.isRequired,
    default:PropTypes.string.isRequired,
    show:PropTypes.bool.isRequired,
    title:PropTypes.string.isRequired,
    toggleText: PropTypes.string.isRequired,
};

export const YueFeiForceRoundTwoDialog = ({G, ctx, moves, events, log, isActive, playerID })=>(
    <ChoiceDialog
        callback={moves.forceRoundTwo}
        choices={[
            {label: "是", value: "yes", disabled: false, hidden: false,},
            {label: "否", value: "no", disabled: false, hidden: false,},
            ]}
        default={"yes"}
        show={G.combatInfo.jinn.isAttacker && G.combatInfo.song.troop.general.includes("岳飞")}
        title="是否强制第二轮？"
        toggleText="岳飞技能"
    />
)


