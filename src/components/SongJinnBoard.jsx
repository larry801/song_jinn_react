import React from 'react'
import {PubInfo} from './pubInfo';
import {PlayerHand} from "./playerHand";
import {TroopList} from "./troopList";
import {RecruitModal} from "./modals/recruit";
import {curPlayerInStage} from "../auto/util";
import ChoosePlanModal from "./modals/choosePlan";
import {CombatCard} from "./combatCard";
import ChoiceDialog from "./modals/base";
import {March} from "./modals/moveArmy";
import {Button} from "@material-ui/core";
import {CombatPanel} from "./combatPanel";
import {TakeDamageModal} from "./modals/takeDamage";

export class SongJinnBoard extends React.Component {

    onPlayAsEvent = (id) => {
        if (this.props.isActive) {
            this.props.moves.playAsEvent(id);
        }
    };

    render() {
        let moves = this.props.moves;
        let G = this.props.G;
        let ctx = this.props.ctx;
        let isActive = this.props.isActive;
        let playerID = this.props.playerID;
        let p;
        let c;
        let player = G.player[playerID];
        let isSong;
        let oc;
        let o;
        if (playerID === G.songPlayer) {
            isSong = true;
            p = G.song;
            o = G.jinn;
            c = G.combatInfo.song;
            oc = G.combatInfo.jinn;
        }
        if (playerID === G.jinnPlayer) {
            isSong = false;
            p = G.jinn;
            o = G.song;
            c = G.combatInfo.jinn
            oc = G.combatInfo.jinn;
        }
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
                    {(ctx.phase === 'drawPlan' && isActive && !p.planChosen) ?
                        <ChoosePlanModal
                            G={G} ctx={ctx} moves={moves} playerID={playerID}
                            isActive={isActive}/> : ""}
                    {curPlayerInStage(G, ctx, 'recruit') && isActive ?
                        <RecruitModal
                            G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                        /> : ""}
                    {isActive && curPlayerInStage(G,ctx,"march")
                        ? <March
                            G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                        /> : ""}
                    <ChoiceDialog
                        callback={moves.recruitOrMarch}
                        choices={[
                            {label: "征募", value: "recruit", disabled: false, hidden: false,},
                            {label: "进军", value: 'march', disabled: false, hidden: false,},
                            {label: "征伪", value: 'recruitVassal', disabled: false, hidden: playerID === G.songPlayer,},
                        ]}
                        default="march"
                        show={isActive && curPlayerInStage(G,ctx, "recruitOrMarch")}
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
                        show={isActive && curPlayerInStage(G,ctx, "siegeOrAttack")}
                        title="请选择要执行的操作"
                        toggleText="攻城或围城"
                    />
                    <PubInfo
                        G={G} ctx={ctx} moves={moves} playerID={playerID}
                        isActive={isActive}
                    />
                    {isActive && curPlayerInStage(G, ctx, "combatCard") && G.combatInfo.stage === "showCombatCard" ?
                        <Button onClick={() => moves.showCombatCard()}>显示战斗牌</Button>
                        : ""}
                    <CombatPanel
                        G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                    />
                    {isActive && playerID === ctx.currentPlayer && G.pending.endStage ?
                        <Button onClick={() => this.props.events.endTurn()}>结束本节</Button> : ""}
                    {isActive && playerID === ctx.currentPlayer && G.pending.endTurn?
                        <Button onClick={() => this.props.events.endTurn()}>结束行动</Button> : ""}
                    {isActive && playerID === ctx.currentPlayer && G.pending.endPhase?
                        <Button onClick={() => this.props.events.endPhase()}>结束阶段</Button> : ""}
                    {isActive && p.planChosen && o.planChosen &&!p.planShown ?
                        <Button onClick={() => moves.showPlanCard(player.chosenPlans)}>展示计划</Button>
                        : ""}
                    {isActive && (curPlayerInStage(G, ctx, "takeDamage") ||
                        G.combatInfo.stage.startsWith("takeDamage")
                    ) && c.pendingDamage > 0 ?
                        <TakeDamageModal
                            G={G} ctx={ctx} moves={moves} playerID={playerID} isActive={isActive}
                        />
                        : ""}
                    {isActive && ( curPlayerInStage(G, ctx, "beatGong") ||
                            G.combatInfo.stage === "beatGong")
                        ?
                        <ChoiceDialog
                            callback={moves.beatGong}
                            choices={[
                                {label: "坚守", value: "defence", disabled: false, hidden: false,},
                                // TODO can retreat
                                {label: "撤退", value: "retreat", disabled: false, hidden: false,},
                                {
                                    label: "继续作战", value: "continue", disabled: false, hidden: !(
                                        c.isAttacker && (
                                            p.military > o.military ||
                                            c.troop.general.includes("岳飞") ||
                                            c.troop.general.includes("兀术") ||
                                            c.combatCards.includes(36)
                                        ) && !G.combatInfo.isRoundTwo
                                    ),
                                },
                            ]}
                            default="attack"
                            show={true}
                            title="请选择要执行的操作"
                            toggleText="鸣金阶段"
                        /> : ""}
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

