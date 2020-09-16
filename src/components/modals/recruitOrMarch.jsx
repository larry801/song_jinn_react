import React, {useState} from 'react';
import {curPlayerInStage} from "../../auto/util";
import FormLabel from "@material-ui/core/FormLabel";
import Button from '@material-ui/core/Button';
import Dialog from "@material-ui/core/Dialog";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Radio from "@material-ui/core/Radio";

export default function RecruitOrMarchModal(props) {

    const [operation, setOperation] = useState('recruit')

    return <Dialog open={curPlayerInStage(props.ctx,'recruitOrMarch') && props.isActive}>

        <FormControl required error={false} component="fieldset">
            <FormGroup>
                <FormLabel component="legend">请选择要执行的操作：</FormLabel>
                <RadioGroup aria-label="请选择要执行的操作：" name="order" value={operation}
                            onChange={(e) => setOperation(e.target.value)}>
                    <FormControlLabel
                        key={0} value={'recruit'}
                        control={<Radio/>}
                        label="征募"/>
                    <FormControlLabel
                        key={1} value={'march'}
                        control={<Radio/>}
                        label="进军"/>
                    {props.playerID === '1'? <FormControlLabel
                        key={2} value={'recruitVassal'}
                        control={<Radio/>}
                        label="征募伪军"
                    />:""}
                </RadioGroup>
                <Button onClick={() => props.moves.recruitOrMarch(operation)}>确认</Button>
            </FormGroup>
        </FormControl>
    </Dialog>
}

