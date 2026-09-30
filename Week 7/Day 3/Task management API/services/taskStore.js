const fs = require('node:fs/promises');
const path = require('node:path');

const tasksFile = path.join(__dirname, '..', 'data', 'tasks.json');
let pendingWrite = Promise.resolve();

async function readTasksFromFile() {
  try {
    const contents = await fs.readFile(tasksFile, 'utf8');
    const tasks = JSON.parse(contents);
    if (!Array.isArray(tasks)) {
      throw new Error('Task data must be a JSON array');
    }
    return tasks;
  } catch (error) {
    if (error instanceof SyntaxError) {
      error.message = 'Task data file contains invalid JSON';
    }
    throw error;
  }
}

async function readTasks() {
  await pendingWrite;
  return readTasksFromFile();
}

function updateTasks(update) {
  const operation = pendingWrite.then(async () => {
    const tasks = await readTasksFromFile();
    const result = update(tasks);
    await fs.writeFile(tasksFile, `${JSON.stringify(tasks, null, 2)}\n`, 'utf8');
    return result;
  });

  pendingWrite = operation.catch(() => {});
  return operation;
}

module.exports = { readTasks, updateTasks };