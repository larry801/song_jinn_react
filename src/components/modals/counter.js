import React, {useReducer} from "react";
import {Button, Typography} from "@material-ui/core";

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
            <Button disabled={!props.canRemove} onClick={() => dispatch({type: 'decrement'})}>-</Button>
            <Typography>{state.count}</Typography>
            <Button disabled={!props.canAdd} onClick={() => dispatch({type: 'increment'})}>+</Button>
        </>
    );
}

