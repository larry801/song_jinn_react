import React from 'react';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {Button} from "@material-ui/core";
import {getJinnCardById, getSongCardById} from "../constants/cards"
import Grid from "@material-ui/core/Grid";
import {canPeaceTalk, canSubmitLetterOfCredence} from "../auto/util";
import ChoiceDialog from "./modals/base";

export class PlayerHand extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            expanded: 0,
            diplomaticCard:null,
        };

    }

    expand(id) {
        this.setState({expanded: id});
    }


    onPlayAsEvent = (id) => {
        if (this.props.isActive) {
            this.props.moves.playAsEvent(id);
        }
    };

    diplomacy=(country)=>{
        this.props.moves.diplomacy({card:this.state.diplomaticCard,target:country})
    }

    canPlayAsEvent(id) {
        const isSong = this.props.playerID === '0';
        if (isSong) {
            return getSongCardById(id).pre(this.props.G, this.props.ctx);
        } else {
            return getJinnCardById(id).pre(this.props.G, this.props.ctx);
        }
    }

    render() {
        const playerID = this.props.playerID;
        let G = this.props.G;
        const isSong = playerID === G.songPlayer;
        let hands = G.player[playerID].hands;
        let card = isSong ? getSongCardById : getJinnCardById
        let isActive = this.props.isActive;
        let ctx = this.props.ctx;
        let inPhase = ctx.phase === 'doOperations';
        let totalRounds = hands.length + this.props.G.roundMarker;
        let emptyRoundButton;
        if (totalRounds <= 8) {
            emptyRoundButton =
                <Grid item>
                    <Button
                        disabled={!(this.props.ctx.phase === 'doOperations' && this.props.isActive)}
                        onClick={() => this.props.moves.emptyRound()}>
                        跳过
                    </Button>
                </Grid>
        }
        let countries =["西辽", "西夏", "吐蕃", "大理", "高丽"]
            .filter((c)=>canSubmitLetterOfCredence(G,ctx,playerID,c))
        return <><ChoiceDialog
            callback={this.diplomacy}
            choices={
             countries.map((c) => {
                    return {
                        label: c,
                        value: c,
                        disabled: !canSubmitLetterOfCredence(G, ctx, playerID, c),
                        hidden: false,
                    }
                })}
            default={countries[0]}
            show={this.state.diplomaticCard !== null && isActive}
            title="请选择国家递交国书"
            toggleText="外交"
        />

            <Grid container>
                {hands.map((id) => <Accordion expanded={this.state.expanded === id} onChange={() => this.expand(id)}
                                              key={id}>
                    <AccordionSummary id={id}>
                        {card(id).op}{' | '} {card(id).name}
                    </AccordionSummary>
                    <AccordionDetails>
                        <Button
                            disabled={!(this.props.isActive && inPhase)}
                            onClick={() => this.props.moves.useOp(id)}
                        >征募和进军</Button>
                        <Button
                            disabled={!(this.canPlayAsEvent(id) && this.props.isActive && inPhase)}
                            onClick={() => this.onPlayAsEvent(id)}
                        >事件</Button>
                        <Button
                            disabled={!(this.props.isActive && inPhase)}
                        >派遣</Button>
                        <Button
                            disabled={!(isActive && inPhase && countries.length!==0)}
                            onClick={() => {
                                this.setState({...this.state, diplomaticCard: hands.indexOf(id)})
                            }}
                        >外交</Button>
                        <Button
                            disabled={!(this.props.isActive && inPhase)}
                            onClick={() => this.props.move.develop(id)}
                        >发展</Button>
                        {isSong ? <Button
                                disabled={!(this.props.isActive && inPhase && canPeaceTalk(this.props.G, this.props.ctx))}
                            >和议</Button> :
                            <Button
                                // TODO troop in supplement bank
                                disabled={!(this.props.isActive && inPhase)}
                            >贴军</Button>}
                    </AccordionDetails></Accordion>
                )}
                {emptyRoundButton}
            </Grid></>
    }

}
