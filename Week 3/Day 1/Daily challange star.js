// Version 1: one loop
let line = "";
for (let i = 1; i <= 6; i++) {
  line += "* ";
  console.log(line.trim());
}

console.log("---");

// Version 2: nested loops
for (let i = 1; i <= 6; i++) {
  let stars = "";
  for (let j = 1; j <= i; j++) {
    stars += "* ";
  }
  console.log(stars.trim());
}
