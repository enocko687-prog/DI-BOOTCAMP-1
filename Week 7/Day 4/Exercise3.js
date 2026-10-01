import React, { Component } from "react";
import "./Exercise.css";

class Exercise extends Component {
	render() {
		const style_header = {
			color: "white",
			backgroundColor: "DodgerBlue",
			padding: "10px",
			fontFamily: "Arial",
		};

		return (
			<div>
				<h1 style={style_header}>This is a React exercise</h1>
				<p className="para">This paragraph is styled with Exercise.css.</p>
				<a href="https://react.dev/">Learn more about React</a>
				<form onSubmit={(event) => event.preventDefault()}>
					<label htmlFor="favorite-animal">Favorite animal: </label>
					<input id="favorite-animal" name="favoriteAnimal" type="text" />
					<button type="submit">Submit</button>
				</form>
				<img
					src="https://picsum.photos/600/240"
					alt="A landscape used for the React HTML tags exercise"
					width="600"
					height="240"
				/>
				<ul>
					<li>Paragraph</li>
					<li>Link</li>
					<li>Form</li>
				</ul>
			</div>
		);
	}
}

export default Exercise;
