import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const celebrities = [
	{
		title: "Bob Dylan",
		imageUrl: "https://miro.medium.com/max/4800/1*_EDEWvWLREzlAvaQRfC_SQ.jpeg",
		buttonLabel: "Go to Wikipedia",
		buttonUrl: "https://en.wikipedia.org/wiki/Bob_Dylan",
		description:
			"Bob Dylan (born Robert Allen Zimmerman, May 24, 1941) is an American singer/songwriter, author, and artist who has been an influential figure in popular music and culture for more than five decades.",
	},
	{
		title: "McCartney",
		imageUrl:
			"https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Paul_McCartney_in_October_2018.jpg/250px-Paul_McCartney_in_October_2018.jpg",
		buttonLabel: "Go to Wikipedia",
		buttonUrl: "https://en.wikipedia.org/wiki/Paul_McCartney",
		description:
			"Sir James Paul McCartney CH MBE (born 18 June 1942) is an English singer, songwriter, musician, composer, and record and film producer who gained worldwide fame as co-lead vocalist and bassist for the Beatles.",
	},
];

const planets = ["Mars", "Venus", "Jupiter", "Earth", "Saturn", "Neptune"];

function BootstrapCard({ celebrity }) {
	return (
		<div
			className="card m-5"
			style={{ width: "30rem", maxWidth: "calc(100% - 6rem)" }}
		>
			<img
				className="card-img-top"
				src={celebrity.imageUrl}
				alt={celebrity.title}
			/>
			<div className="card-body">
				<h2 className="card-title h5">{celebrity.title}</h2>
				<p className="card-text">{celebrity.description}</p>
				<a
					className="btn btn-primary"
					href={celebrity.buttonUrl}
					target="_blank"
					rel="noreferrer"
				>
					{celebrity.buttonLabel}
				</a>
			</div>
		</div>
	);
}

function BootstrapPlanets() {
	return (
		<ul className="list-group">
			{planets.map((planet) => (
				<li className="list-group-item" key={planet}>
					{planet}
				</li>
			))}
		</ul>
	);
}

export default function App() {
	return (
		<main className="container py-4">
			<section className="mb-5" aria-labelledby="celebrities-heading">
				<h1 id="celebrities-heading" className="mb-3">
					Exercise 1: Bootstrap Cards
				</h1>
				<div className="d-flex flex-wrap justify-content-center">
					{celebrities.map((celebrity) => (
						<BootstrapCard
							key={celebrity.title}
							celebrity={celebrity}
						/>
					))}
				</div>
			</section>

			<section aria-labelledby="planets-heading">
				<h2 id="planets-heading" className="mb-3">
					Exercise 2: Planets
				</h2>
				<BootstrapPlanets />
			</section>
		</main>
	);
}

