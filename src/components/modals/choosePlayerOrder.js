import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import {makeStyles} from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    formControl: {
        margin: theme.spacing(3),
    },
}));

export function ChoosePlayerOrder(props) {
    const [value, setValue] = React.useState('0');
    const classes = useStyles();
    const handleChange = (event) => {
        setValue(event.target.value);
    };

    return (
        <Dialog onClose={()=>{}} open={true} className={classes.root}>
        <FormControl component="fieldset" className={classes.formControl}>
            <FormLabel component="legend">请选择先手玩家</FormLabel>
            <RadioGroup aria-label="先手玩家" name="order" value={value} onChange={handleChange}>
                <FormControlLabel value="0" control={<Radio />} label="宋" />
                <FormControlLabel value="1" control={<Radio />} label="金" />
            </RadioGroup>
            <Button onClick={() => {props.moves.choosePlayerWhoMovesFirst(value)}}>
                确认
            </Button>
        </FormControl>
        </Dialog>
    );
}

