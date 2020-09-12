import {jinnCards} from "./jinn";
import {songCards} from "./song";

export function getSongCardById(id) {
    return songCards[id];
}

export function getJinnCardById(id) {
    return jinnCards[id]
}
