import { Readable } from 'stream';

export class StreamCache {
    constructor(inputStream, cacheThreshold = 4000) {
        this.cacheStream = new Readable({
            read() { }
        });
        this.cache = [];
        this.cacheThreshold = cacheThreshold;
        inputStream.on('data', this._addDataToCache);
        inputStream.on('end', () => {
            this._emitCache();
            this.cacheStream.emit('end');
        });
    }

    _addDataToCache = (data) => {
        this.cache.push(data);
        if (this.cache.length >= this.cacheThreshold) {
            this._emitCache();
        }
    }

    _emitCache() {
        if (!this.cache.length) return
        this.cacheStream.push(JSON.stringify(this.cache));
        this.cache = [];
    }

    stream() {
        return this.cacheStream;
    }
}
