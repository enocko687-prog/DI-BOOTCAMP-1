// Exercise 1: Merge Words
const mergeWords = (string) => (nextString) => {
  if (nextString === undefined) {
    return string;
  }
  return mergeWords(string + ' ' + nextString);
};

console.log(mergeWords('Hello')());
console.log(mergeWords('There')('is')('no')('spoon.')());
