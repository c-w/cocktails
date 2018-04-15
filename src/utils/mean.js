function sum(numbers) {
  return numbers.reduce((prev, cur) => prev + cur, 0);
}

export default function mean(numbers) {
  return sum(numbers) / numbers.length;
}
