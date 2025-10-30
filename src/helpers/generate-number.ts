import ShortUniqueId from 'short-unique-id';

export function generateNumber(length: number) {
  const generatedId = new ShortUniqueId({
    dictionary: 'number',
    length: length - 1,
  }).rnd();
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  return firstDigit.toString() + generatedId;
}
