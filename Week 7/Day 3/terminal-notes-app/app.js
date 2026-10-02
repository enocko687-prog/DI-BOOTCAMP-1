#!/usr/bin/env node

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const notes = require('./notes');

function run() {
	const cli = yargs(hideBin(process.argv))
		.scriptName('node app')
		.usage('$0 <command> [options]')
		.command('add', 'Add a note', (command) => command
			.option('title', { type: 'string', demandOption: true, describe: 'Note title' })
			.option('body', { type: 'string', demandOption: true, describe: 'Note body' }), (args) => {
			const result = notes.addNote(args.title, args.body);
			console.log(result.success ? 'Note added successfully' : result.message);
		})
		.command('list', 'List all notes', () => {}, () => {
			const titles = notes.listNotes();
			if (titles.length === 0) {
				console.log('No notes found.');
				return;
			}
			console.log('Your notes:');
			titles.forEach((title, index) => console.log(`${index + 1}. ${title}`));
		})
		.command('read', 'Read a note', (command) => command
			.option('title', { type: 'string', demandOption: true, describe: 'Note title' }), (args) => {
			const note = notes.readNote(args.title);
			if (!note) {
				console.log('Note not found');
				return;
			}
			console.log(`Title: ${note.title}`);
			console.log(`Body: ${note.body}`);
		})
		.command('remove', 'Remove a note', (command) => command
			.option('title', { type: 'string', demandOption: true, describe: 'Note title' }), (args) => {
			const result = notes.removeNote(args.title);
			console.log(result.success ? `Note removed: ${result.note.title}` : result.message);
		})
		.demandCommand(1, 'command not recognized')
		.strict()
		.help()
		.fail((message, error, parser) => {
			const command = hideBin(process.argv)[0];
			const validCommands = ['add', 'list', 'read', 'remove'];
			if (!command || !validCommands.includes(command)) console.error('command not recognized');
			else console.error(error?.message || message || 'Invalid command options.');
			parser.showHelp();
			process.exitCode = 1;
		});

	cli.parse();
}

if (require.main === module) run();

module.exports = { run };