import React from 'react'
import {PubInfo} from './pubInfo';
import {PlayerHand} from "./playerHand";
import {TroopList} from "./troopList";
import {ChoosePlayerOrder} from "./modals/choosePlayerOrder";
import {RecruitModal} from "./modals/recruit";
import {curPlayerInStage, playerInStage} from "../auto/util";
import ChoosePlanModal from "./modals/choosePlan";
import {CombatCard} from "./combatCard";
import ChoiceDialog from "./modals/base";
import {March} from "./modals/moveArmy";
import {Button} from "@material-ui/core";
import {CombatPanel} from "./combatPanel";
// import {TakeDamageTroopList} from "./modals/march";

export class SongJinnBoard extends React.Component {

    onPlayAsEvent = (id) => {
        if (this.props.isActive) {
            this.props.moves.playAsEvent(id);
        }
    };

    render() {
        let moves = this.props.moves;
        //let phase = this.props.ctx.phase;
        let G = this.props.G;
        let ctx = this.props.ctx;
        let isActive = this.props.isActive;
        let playerID = this.props.playerID;
        let p;
        let player = G.player[playerID];
        if(playerID === G.songPlayer)p=G.pub.song;
        if(playerID === G.jinnPlayer)p=G.pub.jinn;
        let winner = '';
        if (ctx.gameover) {
            winner =
                ctx.gameover.winner !== undefined ? (
                    <div id="winner">Winner: {ctx.gameover.winner}</div>
                ) : (
                    <div id="winner">Draw!</div>
                );
        }
        if (isActive) {
            return (
                <div>
                    <ChoiceDialog
                        callback={moves.choosePlayerWhoMovesFirst}
                        choices={[
                            {label: "宋", value: G.songPlayer, disabled: false, hidden: false,},
                            {label: "金", value: G.jinnPlayer, disabled: false, hidden: false,},
                        ]}
                        default={G.songPlayer}
                        show={!G.orderChosen && isActive && ctx.phase === 'chooseOrder'}
                        title="请选择先手玩家"
                        toggleText="选择先手"
                    />
                    {(ctx.phase ==='drawPlan' && isActive && !p.planChosen) ?
                        <ChoosePlanModal
                            G={G} ctx={ctx} moves={moves} playerID={playerID}
                            isActive={isActive}/> : ""}
                    {curPlayerInStage(ctx, 'recruit') && isActive ?
                        <RecruitModal
                            G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                        /> : ""}
                    {isActive && playerInStage(ctx, playerID, "march")
                        ? <March
                            G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                        /> : ""}
                    {isActive && playerID===ctx.currentPlayer ?
                        <Button onClick={()=>this.props.events.endTurn()}>结束行动</Button>:""}
                    {isActive && playerID===ctx.currentPlayer ?
                        <Button onClick={()=>this.props.events.endPhase()}>结束阶段</Button>:""}
                    {isActive && p.planChosen ?
                        <Button onClick={()=>moves.showPlanCard(player.chosenPlans)}>展示计划</Button>
                        :""
                    }
                    <ChoiceDialog
                        callback={moves.recruitOrMarch}
                        choices={[
                            {label: "征募", value: "recruit", disabled: false, hidden: false,},
                            {label: "进军", value: 'march', disabled: false, hidden: false,},
                            {label: "征伪", value: 'recruitVassal', disabled: false, hidden: playerID === G.songPlayer,},
                        ]}
                        default="march"
                        show={isActive && playerInStage(ctx, playerID, "recruitOrMarch")}
                        title="请选择要执行的操作"
                        toggleText="征募和进军"
                    />
                    <ChoiceDialog
                        callback={moves.siegeOrAttack}
                        choices={[
                            {label: "攻城", value: "attack", disabled: false, hidden: false,},
                            {label: "围城", value: 'siege', disabled: false, hidden: false,},
                        ]}
                        default="attack"
                        show={isActive && playerInStage(ctx, playerID, "siegeOrAttack")}
                        title="请选择要执行的操作"
                        toggleText="攻城或围城"
                    />
                    <PubInfo
                        G={G} ctx={ctx} moves={moves} playerID={playerID}
                        isActive={isActive}
                    />
                    {G.combatInfo.stage ==="showPlanCard"?
                        <Button onClick={()=>moves.showPlanCard()}>展示计划牌</Button>
                        :""}
                    {G.combatInfo.stage ==="showCombatCard"?
                        <Button onClick={()=>moves.showCombatCard()} >显示战斗牌</Button>
                        :""}
                    <CombatPanel
                        G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                    />
                    <CombatCard
                        G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                    />
                    <PlayerHand
                        G={G} ctx={ctx} moves={moves} playerID={playerID}
                        isActive={isActive}
                    />
                    <TroopList
                        G={G} ctx={ctx} moves={moves} playerID={playerID}
                        isActive={isActive}
                        callback={() => {
                        }}
                    />
                    {winner}
                </div>
            );
        } else return ""
    }
}

