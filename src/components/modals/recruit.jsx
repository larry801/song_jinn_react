import React from 'react';
import {UNIT_SHORTHAND} from "../../constants/general";
import {canRecruit, curPlayerInStage, getRecruitTotalCost, isUnitCounterInsufficient} from "../../auto/util";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import {Typography} from "@material-ui/core";

export class RecruitModal extends React.Component {
    constructor(props) {
        super(props);
        if (props.playerID === props.G.songPlayer) {
            this.state = {
                owner: 0,
                unitsToRecruit: [0, 0, 0, 0, 0, 0],
                open:true,
            }
        } else {
            this.state = {
                owner: 1,
                unitsToRecruit: [0, 0, 0, 0, 0, 0, 0],
                open:true,
            }
        }
    }

    onOpenModal = () => {
        this.setState({open: true});
    };

    onCloseModal = () => {
        this.setState({open: false});
        this.props.moves.recruit(this.state.unitsToRecruit);
    };
    /*
    能否多征募一个单位
     */
    canAddUnit = (units, i) => {
        let newUnits = JSON.parse(JSON.stringify(units));
        newUnits[i] = newUnits[i] + 1;
        return canRecruit(this.props.G, this.props.ctx, newUnits)
    };
    /*
    检查备用兵库 不足发出警告
     */
    isBankInsufficient = (units, i) => {
        return isUnitCounterInsufficient(this.props.G, this.props.ctx, units);
    };

    addUnit = (i) => {
        let unitsToRecruit = JSON.parse(JSON.stringify(this.state.unitsToRecruit));
        unitsToRecruit[i] = unitsToRecruit[i] + 1;
        this.setState({
            unitsToRecruit: unitsToRecruit
        })
    };

    removeUnit = (i) => {
        let unitsToRecruit = this.state.unitsToRecruit;
        unitsToRecruit[i] = unitsToRecruit[i] - 1;
        this.setState({
            unitsToRecruit: unitsToRecruit
        })
    };

    render() {
        let ctx = this.props.ctx;
        let playerID = this.props.playerID;
        let isActive = this.props.isActive;
        let G = this.props.G;
        let showModal = curPlayerInStage(G, ctx, 'recruit') && isActive;
        const {owner, unitsToRecruit} = this.state;
        let recruitPermission = G.recruitPermission[playerID];
        let unitNames = UNIT_SHORTHAND[owner];
        let recruitUI = [];
        let cost = getRecruitTotalCost(G, ctx, unitsToRecruit);
        let remain = this.props.G.opForRecruitAndMarch - cost;
        for (let i = 0; i < unitNames.length; i++) {
            if (recruitPermission[i]) {
                recruitUI.push(<div key={"adjust"+UNIT_SHORTHAND[playerID][i]}>
                        <label>{UNIT_SHORTHAND[playerID][i]}:</label>
                        <Button disabled={unitsToRecruit[i] === 0}
                                 onClick={() => {this.removeUnit(i)
                        }}
                        >-</Button>
                        {unitsToRecruit[i]}
                        <Button disabled={!this.canAddUnit(unitsToRecruit, i)}
                                onClick={() => {
                                    this.addUnit(i)
                                }}
                        >+</Button>
                    </div>
                )
            }
        }

        let resultUI = <div key="result">
            本次征募一共消耗 {cost} OP 剩余 {remain} OP
        </div>;
        let unitCounterInsufficientWarning = '';
        if (this.isBankInsufficient(unitsToRecruit)) {
            unitCounterInsufficientWarning = <b color={"red"}>备用兵库不足 征募无效 浪费OP</b>
        }
        if (showModal) {
            return <div>
                <Button variant={"outlined"} onClick={()=>this.setState({open:false})}>征募</Button>
                <Dialog open={this.state.open}>
                <Typography>可以使用{this.props.G.opForRecruitAndMarch} OP 征募</Typography>
                {recruitUI}
                {resultUI}
                {unitCounterInsufficientWarning}
                <button onClick={()=>{this.onCloseModal()}}>确认</button>
            </Dialog></div>
        }else{
            return <div/>
        }
    }
}
