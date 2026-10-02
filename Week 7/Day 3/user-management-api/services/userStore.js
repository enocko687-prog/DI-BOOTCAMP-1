const fs = require('node:fs/promises');

const writeQueues = new Map();

async function readUsersFromFile(filePath) {
	const contents = await fs.readFile(filePath, 'utf8');
	const users = JSON.parse(contents);
	if (!Array.isArray(users)) {
		throw new Error('User data file must contain a JSON array.');
	}
	return users;
}

async function readUsers(filePath) {
	await (writeQueues.get(filePath) || Promise.resolve());
	return readUsersFromFile(filePath);
}

function updateUsers(filePath, update) {
	const previousWrite = writeQueues.get(filePath) || Promise.resolve();
	const operation = previousWrite.then(async () => {
		const users = await readUsersFromFile(filePath);
		const result = await update(users);
		await fs.writeFile(filePath, `${JSON.stringify(users, null, 2)}\n`, 'utf8');
		return result;
	});
	writeQueues.set(filePath, operation.catch(() => {}));
	return operation;
}

module.exports = { readUsers, updateUsers };