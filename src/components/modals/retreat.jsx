import React from "react";
import ChoiceDialog from "./base";
import {troopToUnits} from "../../auto/util";
import {UNIT_SHORTHAND} from "../../constants/general";

export const RetreatModal = ({G, playerID,moves}) => {

    const i = G.combatInfo;
    const isSong = G.songPlayer === playerID;
    const c = isSong ? i.song : i.jinn;
    const short = isSong ? UNIT_SHORTHAND[0] : UNIT_SHORTHAND[1]
    const retreat = (choice)=>{
        moves.retreat({playerID:playerID,choice:choice})
    }
    return <ChoiceDialog
        callback={retreat}
        choices={troopToUnits({units: c.troop.units, general: []}).map((i, idx) => {
            if (i === 0) {
                return {label: "", value: "", hidden: true, disabled: true};
            } else {
                return {label: short[idx], value: idx, hidden: false, disabled: false};
            }
        })}
        default={0}
        show={true}
        title="请选择撤退时被追击损失的部队"
        toggleText="撤退损失"
    />
}
