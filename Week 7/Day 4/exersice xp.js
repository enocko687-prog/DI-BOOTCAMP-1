import React, { Component } from "react";
import UserFavoriteAnimals from "./UserFavoriteAnimals.js";
import Exercise from "./Exercise3.js";

const user = {
	firstName: "Bob",
	lastName: "Dylan",
	favAnimals: ["Horse", "Turtle", "Elephant", "Monkey"],
};

const myelement = <h1>I Love JSX!</h1>;
const sum = 5 + 5;

class App extends Component {
	render() {
		return (
			<main>
				<section>
					<h2>Exercise 1: JSX</h2>
					<p>Hello World!</p>
					{myelement}
					<p>React is {sum} times better with JSX</p>
				</section>

				<section>
					<h2>Exercise 2: Object</h2>
					<h3>{user.firstName}</h3>
					<h3>{user.lastName}</h3>
					<UserFavoriteAnimals favAnimals={user.favAnimals} />
				</section>

				<section>
					<h2>Exercise 3: HTML Tags in React</h2>
					<Exercise />
				</section>
			</main>
		);
	}
}

export default App;
