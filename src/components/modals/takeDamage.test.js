import {canTakeDamage} from "../../auto/util";

// noinspection JSUnresolvedFunction
test("Er che",()=>{
    expect(canTakeDamage({        combatInfo:{
            isRoundTwo:false,
            pendingCombat:false,
            stage:null,
            isSiege:false,
            song:{
                pendingDamage:0,
                combatCards:[],
                dices:[],
                troop:{
                    units: [2, 2, 0, 0, 0, 0],
                    general: [],
                    region: 20,
                    city: 0,
                },
                isAttacker:false,
                beatGongChoice:"",
            },
            jinn:{
                pendingDamage:2,
                combatCards:[],
                dices:[],
                troop:{
                    units: [1, 2, 1, 0, 1, 0, 0],
                    general: [],
                    region: 20,
                    city: 0,
                },
                isAttacker:false,
                beatGongChoice:"",
            }
        },},{},{
        eliminated:[],
        defeated:[{type:2,owner:'jinn'}],
    })).toBe(true);
})
