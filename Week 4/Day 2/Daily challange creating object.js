class Video {
	constructor(title, uploader, time) {
		this.title = title;
		this.uploader = uploader;
		this.time = time;
	}

	watch() {
		console.log(`${this.uploader} watched all ${this.time} of ${this.title}!`);
	}
}

const firstVideo = new Video("JavaScript Basics", "Alice", 300);
firstVideo.watch();

const secondVideo = new Video("Object-Oriented Programming", "Bob", 480);
secondVideo.watch();

// Bonus: Store the data as objects, then create Video instances in a loop.
const videoData = [
	{ title: "HTML Fundamentals", uploader: "Charlie", time: 240 },
	{ title: "CSS Layouts", uploader: "Diana", time: 360 },
	{ title: "JavaScript Arrays", uploader: "Ethan", time: 420 },
	{ title: "DOM Manipulation", uploader: "Fatima", time: 510 },
	{ title: "Async JavaScript", uploader: "George", time: 600 }
];

const videos = [];

for (const data of videoData) {
	const video = new Video(data.title, data.uploader, data.time);
	videos.push(video);
	video.watch();
}
