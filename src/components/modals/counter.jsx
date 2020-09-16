import React, {useReducer} from "react";
import {Button, Typography} from "@material-ui/core";
import PropTypes from 'prop-types'



function Counter({canAdd,canMinus,reducer,count}) {
    const [state, dispatch] = useReducer(reducer, count);
    return (
        <>
            <Button disabled={canMinus} onClick={() => dispatch({type: 'decrement'})}>-</Button>
            <Typography>{state}</Typography>
            <Button disabled={canAdd} onClick={() => dispatch({type: 'increment'})}>+</Button>
        </>
    );
}

Counter.propTypes ={
    canAdd:PropTypes.bool.isRequired,
    canMinus:PropTypes.bool.isRequired,
    count:PropTypes.number.isRequired,
    reducer:PropTypes.func.isRequired,
}
