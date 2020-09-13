import React, {useReducer} from "react";
import {Button, Typography} from "@material-ui/core";
import PropTypes from 'prop-types'

function reducer(state, action) {
    switch (action.type) {
        case 'increment':
            return {count: state.count + 1};
        case 'decrement':
            return {count: state.count - 1};
        default:
            throw new Error();
    }
}

function Counter(props) {
    const [state, dispatch] = useReducer(reducer, {count:props.count});
    return (
        <>
            <Button disabled={!props.canMinus} onClick={() => dispatch({type: 'decrement'})}>-</Button>
            <Typography>{state.count}</Typography>
            <Button disabled={!props.canAdd} onClick={() => dispatch({type: 'increment'})}>+</Button>
        </>
    );
}

Counter.propTypes ={
    canAdd:PropTypes.func.isRequired,
    canMinus:PropTypes.func.isRequired,
    count:PropTypes.number.isRequired,
}
