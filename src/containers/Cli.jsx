import React from 'react'

import s from '../stylesheets/cli.module.css'

export default class extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            textarea: '',
            commandLine: '',
        }

        this.addToTextArea.bind(this);
    }

    componentDidMount() {
        this.addToTextArea('Made by Artem Tarnovskiy, 2020 - LAB3 \n\nFamiliarity with the existing' +
            'methods of structuring memory, memory management algorithms and converting virtual ' +
            'addresses into physical. \n\n===================================\n\n' +
            'Print \'help\' to get help menu');
    }

    addToTextArea = (text, clear = false, callback = () => {}) => {
        this.setState({
            textarea: clear ? '' : this.state.textarea + '\n' + text
        }, callback)
    }

    sizeSetter = (flag, param) => {
        this.props.eventListener({
            type: flag === 'r' ? 'UPDATE_RAM_SIZE' : 'UPDATE_CACHE_SIZE',
            value: +param
        })
    }

    displayHelpMenu = () => {
        this.addToTextArea('\n--- get <address> - get data from RAM by address\n' +
            '--- clear - clear CacheMemory\n' +
            '--- set <flags> <address> - set data to memory by address\n' +
            '\t <flags>: \n\t c - set data to cache\n\t r - set data to ram\n' +
            '--- cls - clear command line buffer\n' +
            '--- set <flags> <size> - set size in 32bits words \n' +
            '\t <flags>: \n\t c - set size of cache memory\n\t r - set size of ram memory\n' +
            '--- gen - generate data in ram memory\n' +
            '--- info - display information about current settings')
    }

    cliListener = () => {
        const command = this.state.commandLine.replace(/\s+/g, ' ').trim().split(' ');
        console.log(command)
        switch (command[0]) {
            case 'help':
                this.displayHelpMenu();
                break;
            case 'cls':
                this.addToTextArea(null, true)
                break;
            case 'info':
                this.addToTextArea(`\nCache size - ${
                    this.props.eventListener({type: 'GET_CACHE_SIZE'}) * 32
                } KBit\nRAM size - ${
                    this.props.eventListener({type: 'GET_RAM_SIZE'}) * 32
                } KBit`);
                break;
            case 'set':
                if (command[1] === 'c') {
                    if (Number.isInteger(+command[2])) {
                        if ((this.props.eventListener({type: 'GET_RAM_SIZE'}) / +command[2] >= 10) || (this.props.eventListener({type: 'GET_RAM_SIZE'}) === 0 && this.props.eventListener({type: 'GET_CACHE_SIZE'}) === 0)) {
                            this.sizeSetter(command[1], command[2])
                        } else this.addToTextArea(`\nBad size \'${command[2]}\'. RAM size should be must be at least 10 times larger than cache`)
                    } else this.addToTextArea(`\nBad size \'${command[2]}\'. Should be integer`)
                } else if (command[1] === 'r') {
                    if (Number.isInteger(+command[2])) {
                        if ((+command[2] / this.props.eventListener({type: 'GET_CACHE_SIZE'}) >= 10) || (this.props.eventListener({type: 'GET_RAM_SIZE'}) === 0 && this.props.eventListener({type: 'GET_CACHE_SIZE'}) === 0)) {
                            this.sizeSetter(command[1], command[2])
                        } else this.addToTextArea(`\nBad size \'${command[2]}\'. RAM size should be must be at least 10 times larger than cache`)
                    } else this.addToTextArea(`\nBad size \'${command[2]}\'. Should be integer`)
                } else this.addToTextArea(`\nUnknown param \'${command[1]}\'. Try \'help\' for help`)
                break;
            case 'gen':
                this.props.eventListener({type: 'GENERATE'})
                break;
            default:
                this.addToTextArea(`\nUnknown command \'${command[0]}\'. Try \'help\' for help`)
        }

        this.setState({
            commandLine: ''
        })
    }


    render() {
        return (
            <div className={s.wrapper}>
                <p>TERMINAL</p>
                <textarea value={this.state.textarea} disabled/>
                <span className={s.input_wrapper}> >>
                    <input value={this.state.commandLine}
                           onKeyDown={(e) => {
                               if (e.key === 'Enter') {
                                   this.addToTextArea(`\n>> ${this.state.commandLine}`, false, this.cliListener)
                               }
                           }}
                           onChange={e => this.setState({
                               commandLine: e.target.value
                           })}
                           type={'text'}
                    />
                </span>
            </div>
        )
    }
}
