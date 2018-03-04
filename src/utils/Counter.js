const buildCounter = (iterable) => {
  const counter = {};
  let length = 0;

  iterable.forEach(item => {
    if (!counter[item]) {
      counter[item] = 1;
      length++;
    } else {
      counter[item]++;
    }
  });

  return { counter, length };
}

export default class Counter {
  constructor(iterable) {
    const { counter, length } = buildCounter(iterable)
    this._counter = counter;
    this._length = length;
  }

  mostCommon(num) {
    return Object.entries(this._counter)
      .sort(([itemA, countA], [itemB, countB]) => countA - countB)
      .map(([item, count]) => item)
      .slice(this._length - num);
  }
}
