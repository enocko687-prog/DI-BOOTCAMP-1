// Exercise 1: Promise.all()
const promise1 = Promise.resolve(3);
const promise2 = 42;
const promise3 = new Promise((resolve) => {
	setTimeout(resolve, 3000, "foo");
});

// Promise.all waits for every promise, accepts regular values as resolved
// values, and keeps the order of the input array. If any promise rejects,
// the whole Promise.all call rejects and the catch block handles the error.
Promise.all([promise1, promise2, promise3])
	.then((values) => console.log(values))
	.catch((error) => console.log(error));

// Exercise 2: Analyse Promise.all()
function timesTwoAsync(x) {
	return new Promise((resolve) => resolve(x * 2));
}

const arr = [1, 2, 3];
const promiseArr = arr.map(timesTwoAsync);

Promise.all(promiseArr).then((result) => {
	console.log(result);
});
