const { server } = require('./user-management-api/server');

const PORT = Number(process.env.PORT || 3003);

if (require.main === module) {
	server.listen(PORT, () => {
		console.log(`User management API running at http://localhost:${PORT}`);
	});
}

module.exports = { server };
