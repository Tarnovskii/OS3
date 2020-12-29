import React, {Fragment} from 'react'

import Cli from "./containers/Cli";

import s from './stylesheets/main.module.css'
import {CacheController} from "./controllers/CacheController";
import {CACHE} from "./components/CACHE";
import {RAM} from "./components/RAM";

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

        this.cache = null;
        this.ram = null;
        this.controller = null;
        this.eventListener.bind(this)
    }

    componentDidMount() {
        this._fillRamLowerBits('RAM');
        this._fillHigherBits('RAM');
    }

    listener = () => this.forceUpdate();

    _fillRamLowerBits = (type) => {
        let tmp = [];
        if (type === 'RAM') {
            for (let i = 0; i <= parseInt('F', 16); i++) {
                tmp.push(<span>0{i.toString(16)}</span>)
            }
            this.setState({
                ramRowCells: tmp
            })
        }
    }

    _fillHigherBits = (type) => {
        let tmp = []
        if (type === 'RAM') {
            for (let i = 0; i < Math.ceil(this.state.genData.ramSize / 32); i++) {
                let number = i.toString(16).split('')
                if (number.length === 1) tmp.push(<span>000{number[0]}</span>)
                if (number.length === 2) tmp.push(<span>00{number[0]}{number[1]}</span>)
                if (number.length === 3) tmp.push(<span>0{number[0]}{number[1]}{number[2]}</span>)
                if (number.length === 4) tmp.push(<span>{number[0]}{number[1]}{number[2]}{number[3]}</span>)
            }
            this.setState({
                ramColumnCells: tmp
            })
        } else {
            for (let i = 0; i < Math.ceil(this.state.genData.cacheSize / 64); i++) {
                let number = i.toString(16).split('')
                if (number.length === 1) tmp.push(<span>000{number[0]}</span>)
                if (number.length === 2) tmp.push(<span>00{number[0]}{number[1]}</span>)
                if (number.length === 3) tmp.push(<span>0{number[0]}{number[1]}{number[2]}</span>)
                if (number.length === 4) tmp.push(<span>{number[0]}{number[1]}{number[2]}{number[3]}</span>)
            }
            this.setState({
                cacheColumnCells: tmp
            })
        }
    }


    _start = () => {
        this.ram = new RAM(this.state.genData.ramSize, this.listener);
        this.cache = new CACHE(this.state.genData.cacheSize, null, this.listener);

        this.ram.fill();
        this.cache.fill();
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
                }, () => this._fillHigherBits('RAM'))
                break;
            case 'UPDATE_CACHE_SIZE':
                this.setState({
                    genData: {
                        ...this.state.genData,
                        cacheSize: event.value
                    }
                }, () => this._fillHigherBits('CACHE'))
                break;
            case 'GENERATE':
                this._start();
                break;
            case 'SET_DATA':
                this.cache.set({
                    data: this.ram.get(event.value),
                    address: event.value,
                }).then(res => {
                    if (res.status === 'MODIFIED') {
                        this.ram.update(res.address, res.value)
                    }
                })
                break;
            case 'UPDATE_DATA':
                this.cache.update({
                    address: event.value.address,
                    data: event.value.data,
                })
                break;
            case 'FREE_DATA':
                this.cache.free(event.value).then(res => {
                    if (res.status === 'MODIFIED') {
                        this.ram.update(event.value, res.value)
                    }
                })
                break;
            case 'GET_DATA':
                this.cache.find(event.value).then(res => {
                    if (res.status === 'OK') {
                        event.callback(res.value.data.data)
                    } else {
                        event.callback('No element in cache found. Looking in RAM MEMORY...\n')
                        let data = this.ram.get(event.value);
                        event.callback('Element was found in RAM. Getting element and pushing to CACHE memory...\n')
                        this.cache.set({
                            address: event.value,
                            data: data,
                        })
                        event.callback(data)
                    }
                })
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
                                {this.ram === null ? null : this.ram.getAllData().map(e => <span>{e}</span>)}
                            </div>
                        </div>
                    </section>
                    <section className={s.ram}>
                        <p>CACHE MEMORY</p>
                        <div className={s.row_counter}>
                            <CacheTemplate isHeader={true}/>
                        </div>
                        <div className={s.ram_data_wrapper}>
                            <div className={s.column_counter}>
                                {this.state.cacheColumnCells}
                            </div>
                            <div className={s.ram_data}>
                                {this.cache === null ? null : this.cache.getAllData().map((e) => <CacheTemplate
                                    {...e}
                                />)}
                            </div>
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
            <b>{props.isHeader ? 'TAG' : props.tag}</b>
            <b>{props.isHeader ? `VLD` : props.valid}</b>
            <b>{props.isHeader ? `CTR` : props.counter}</b>
            <b>{props.isHeader ? `MDF` : props.modify}</b>
            <b>{props.isHeader ? `DATA` : props.data}</b>
        </div>
    )
}
