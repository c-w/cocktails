const buildCounter = (iterable) => {
  const counter = {};

  iterable.forEach(item => {
    if (!counter[item]) {
      counter[item] = 1;
    } else {
      counter[item]++;
    }
  });

  return counter;
}

export default class Counter {
  constructor(iterable) {
    this._counter = buildCounter(iterable);
  }

  mostCommon(num) {
    return Object.entries(this._counter)
      .sort(([itemA, countA], [itemB, countB]) => countB - countA)
      .map(([item, count]) => item)
      .slice(0, num);
  }
}
