// Exercise 1: Checking the BMI
const person1 = {
  fullName: "John",
  mass: 70,
  height: 1.75,
  bmi: function () {
    return this.mass / (this.height * this.height);
  }
};

const person2 = {
  fullName: "Sarah",
  mass: 65,
  height: 1.68,
  bmi: function () {
    return this.mass / (this.height * this.height);
  }
};

function compareBMI(personA, personB) {
  const bmiA = personA.bmi();
  const bmiB = personB.bmi();

  if (bmiA > bmiB) {
    console.log(`${personA.fullName} has the largest BMI.`);
  } else if (bmiB > bmiA) {
    console.log(`${personB.fullName} has the largest BMI.`);
  } else {
    console.log("Both persons have the same BMI.");
  }
}

compareBMI(person1, person2);

// Exercise 2: Grade Average
function calculateAverage(gradesList) {
  let sum = 0;
  for (let i = 0; i < gradesList.length; i++) {
    sum += gradesList[i];
  }
  return sum / gradesList.length;
}

function checkResult(average) {
  if (average > 65) {
    console.log("Passed");
  } else {
    console.log("Failed and must repeat the course.");
  }
}

function findAvg(gradesList) {
  const average = calculateAverage(gradesList);
  console.log(`Average: ${average}`);
  checkResult(average);
}

findAvg([80, 70, 90, 60, 75]);
