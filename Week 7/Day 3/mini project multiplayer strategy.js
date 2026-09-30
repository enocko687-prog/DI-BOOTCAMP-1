const { server } = require('./multiplayer-strategy-game/server');

const PORT = Number(process.env.PORT || 3002);

if (require.main === module) {
	server.listen(PORT, () => {
		console.log(`Gridbound is running at http://localhost:${PORT}`);
	});
}

module.exports = { server };
