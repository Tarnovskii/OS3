export class RAM {
    constructor(size, listener) {
        this.size = size;
        this.listener = listener;
        this.data = []
    }

    _getRandomIntInclusive = (min, max) => {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    getAllData = () => this.data;

    fill = () => {
        for (let i = 0; i < this.size / 2; i++) {
            this.data.push(this._getRandomIntInclusive(0, parseInt('FFFF', 16)).toString(16))
        }

        this.listener();
    }

    update = (address, value) => {
        this.data[parseInt(address, 16)] = value

        this.listener();
    }

    get = (address) => this.data[parseInt(address, 16)]
}

