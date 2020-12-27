import React, {Fragment} from 'react'

import Cli from "./containers/Cli";

import s from './stylesheets/main.module.css'
import {CacheController} from "./controllers/CacheController";

export class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            genData: {
                ramSize: 0,
                cacheSize: 0,
            },
            ramRowCells: [],
            ramColumnCells: [],
            ramData: [],
            cacheData: [],
            cacheColumnCells: [],
        }

        this.controller = null;
        this.eventListener.bind(this)
    }

    componentDidMount() {
        this._fillRow();
        this._fillColumn();
    }


    _fillRow = () => {
        let tmp = [];
        for (let i = 0; i <= parseInt('F', 16); i++) {
            tmp.push(<span>0{i.toString(16)}</span>)
        }
        this.setState({
            ramRowCells: tmp
        })
    }

    _getRandomIntInclusive = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    _fillColumn = () => {
        let tmp = []
        for (let i = 0; i < Math.ceil(this.state.genData.ramSize / 16); i++) {
            let number = i.toString(16).split('')
            if (number.length === 1) tmp.push(<span>0{number[0]}</span>)
            if (number.length === 2) tmp.push(<span>{number[0]}{number[1]}</span>)
            if (number.length === 3) tmp.push(<span>{number[0]}x{number[1]}{number[2]}</span>)
        }
        this.setState({
            ramColumnCells: tmp
        })
    }

    _generateRamData = () => {
        let data = [];
        for (let i = 0; i < this.state.genData.ramSize; i++) {
            data.push(<span>{this._getRandomIntInclusive(0, parseInt('FFFF', 16)).toString(16)}</span>)
        }
        this.setState({
            ramData: data,
        })
    }

    eventListener = (event) => {
        switch (event.type) {
            case 'GET_RAM_SIZE':
                return this.state.genData.ramSize
            case 'GET_CACHE_SIZE':
                return this.state.genData.cacheSize
            case 'UPDATE_RAM_SIZE':
                this.setState({
                    genData: {
                        ...this.state.genData,
                        ramSize: event.value
                    }
                }, () => this._fillColumn())
                break;
            case 'UPDATE_CACHE_SIZE':
                this.setState({
                    genData: {
                        ...this.state.genData,
                        cacheSize: event.value
                    }
                }, () => this._fillColumn())
                break;
            case 'GENERATE':
                this._generateRamData();
                break;
        }
    }

    render() {
        return (
            <Fragment>
                <Cli eventListener={(e) => this.eventListener(e)}/>
                <div className={s.data}>
                    <section className={s.ram}>
                        <p>RAM MEMORY</p>
                        <div className={s.row_counter}>
                            {this.state.ramRowCells}
                        </div>
                        <div className={s.ram_data_wrapper}>
                            <div className={s.column_counter}>
                                {this.state.ramColumnCells}
                            </div>
                            <div className={s.ram_data}>
                                {this.state.ramData}
                            </div>
                        </div>
                    </section>
                    <section className={s.ram}>
                        <p>CACHE MEMORY</p>
                        <div className={s.row_counter}>
                            <CacheTemplate isHeader={true}/>
                        </div>
                    </section>
                </div>
            </Fragment>
        )
    }
}

const CacheTemplate = (props) => {
    return (
        <div className={s.cache_template}>
            <b>{props.isHeader ? 'TAG' : 'TAG'}</b>
            <b>{props.isHeader ? `VLD` : `VLD`}</b>
            <b>{props.isHeader ? `MDF` : `MDF`}</b>
            <b>{props.isHeader ? `DATA`: `DATA`}</b>
        </div>
    )
}
