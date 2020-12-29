export class CACHE {
    constructor(size, addressSize, listener) {
        this.size = size;
        this.lines = [];
        this.listener = listener;
    }


    _addToCache = (data) => this.lines.push(data)

    fill = () => {
        for (let i = 0; i < this.size / 64; i++) {
            this._addToCache({
                tag: '',
                valid: '0',
                counter: '00',
                modify: '0',
                data: '0000'
            })
        }
        this.listener();
    }

    find = async (address) => {
        let index = this.lines.findIndex(e => parseInt(e.tag, 16) === parseInt(address, 16))

        if (index !== -1) {
            this.lines[index].counter = (parseInt(this.lines[index].counter, 16) + 1).toString(16)
            this.listener();
            this.lines[index].valid = '1'
        }

        return index !== -1 ? {
            status: 'OK', value: {
                data: {
                    ...this.lines[index]
                },
                index: index
            }
        } : {
            status: 'NOTFOUND'
        }
    }

    set = async (data) => {
        let index = this.lines.findIndex(e => e.valid === '0');

        let status = {
            status: 'OK'
        };

        if (index === -1) {
            let el = [...this.lines].sort((a, b) => parseInt(a.counter, 16) - parseInt(b.counter, 16))[0]

            index = this.lines.findIndex(e => e.tag === el.tag);

            this.free(el.tag).then(res => status = res);
        }

        this.lines[index] = {
            tag: data.address,
            valid: data.valid ? data.valid : '1',
            counter: data.counter ? data.counter : '00',
            modify: data.modify ? data.modify : '0',
            data: data.data,
        }

        this.listener();

        return status;
    }

    update = async (action) => {
        let index = this.lines.findIndex(e => parseInt(e.tag, 16) === parseInt(action.address, 16))

        if (index !== -1) {
            this.lines[index] = {
                ...this.lines[index],
                modify: '1',
                data: action.data,
            }
        } else {
            await this.set({
                data: action.data,
                address: action.address,
                modify: '1'
            })
        }

        this.listener();
    }

    free = async (address) => {
        let index = this.lines.findIndex(e => parseInt(e.tag, 16) === parseInt(address, 16))

        let result = {
            status: 'OK'
        }

        if (index !== -1) {
            this.lines[index].valid = '0'
        }

        if (this.lines[index].modify === '1') {
            result = {
                status: 'MODIFIED',
                value: this.lines[index].data,
                address: this.lines[index].tag
            }
        }

        this.listener();

        return result;
    }

    getAllData = () => this.lines;
}
