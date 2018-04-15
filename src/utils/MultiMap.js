export default class MultiMap {
  constructor() {
    this._map = {};
  }

  add(key, item) {
    if (!this._map[key]) this._map[key] = [];
    this._map[key].push(item);
  }

  get(key) {
    return this._map[key] || [];
  }

  map(func) {
    return Object.entries(this._map).map(func);
  }
}
