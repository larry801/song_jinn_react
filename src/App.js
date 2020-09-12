import React from 'react';
import {SongJinnBoard} from './components/SongJinnBoard'
import './App.css';
import {Client} from "boardgame.io/react";
import {SongJinn} from "./auto/game";
import {Local} from "boardgame.io/multiplayer";
import {Grid} from "@material-ui/core";
import {SongJinnMap} from "./components/map";
import { CssBaseline } from '@material-ui/core';

const SongJinnClient = Client({
    game: SongJinn,
    board: SongJinnBoard,
    multiplayer: Local(),
});
//const QinChessClient = Client({
//     game: QinChess,
//     board: QinChessBoard,
//     multiplayer: {local: true}
// });
// let importedGames = [{
//     game: SongJinn,
//     board: SongJinnBoard,
// },];
const App = () => (
    <CssBaseline>
    <Grid container>
        <Grid item xs={6}>
            <SongJinnClient playerID="0"/>
        </Grid>
        <Grid item xs={6}>
            <SongJinnClient playerID="1"/>
        </Grid>
        <Grid item><SongJinnMap/></Grid>
    </Grid>
    </CssBaseline>
);
// const App2 = () => (
//     <Lobby
//         gameServer={`http://${window.location.hostname}:8233`}
//         lobbyServer={`http://${window.location.hostname}:8233`}
//         gameComponents={importedGames}
//     />
// );
export default App;
