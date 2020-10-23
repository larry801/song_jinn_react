import React from 'react';
import echarts from 'echarts/lib/echarts';
import ReactEcharts from "echarts-for-react";
import {MapData} from "../constants/map"

export class SongJinnMap extends React.Component {

    constructor(props) {
        super(props);
        echarts.registerMap("songJinn",MapData)
    }

    getOption() {
        return {
            backgroundColor: 'rgba(128, 120, 128, 0.4)',
            title: {
                text: '地图',
                left: 'center',
                textStyle: {
                    color: '#888'
                }
            },
            geo: {
                map: "songJinn",
                show: true,
                roam: true,
                center: [115, 30],
                zoom: 4,
                scaleLimit: {
                    min: 1,
                    max: 60,
                },
                boundingCoords: [
                    [110, 45],
                    [125, 30]
                ],
            },
            series: [

            ]
        }
    }

    render() {
        return <ReactEcharts
            echarts={echarts}
            option={this.getOption()}
            notMerge={true}
            lazyUpdate={false}
            theme={"cool"}
            style={{height: '650px', width: '1020px'}}
            opts={{renderer: 'canvas'}}/>
    }
}
