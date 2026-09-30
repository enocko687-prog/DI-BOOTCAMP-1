const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { addNote, listNotes, readNote, removeNote } = require('../notes');

let tempDirectory;
let notesFile;

before(() => {
	tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-notes-'));
	notesFile = path.join(tempDirectory, 'notes.json');
	fs.writeFileSync(notesFile, '[]\n', 'utf8');
});

after(() => fs.rmSync(tempDirectory, { recursive: true, force: true }));

test('add, list, read, reject duplicate titles, and remove notes', () => {
	const added = addNote('Trip', 'Pack a raincoat.', notesFile);
	assert.equal(added.success, true);
	assert.equal(added.note.title, 'Trip');
	assert.equal(added.note.body, 'Pack a raincoat.');
	assert.deepEqual(listNotes(notesFile), ['Trip']);
	assert.equal(readNote('trip', notesFile).body, 'Pack a raincoat.');

	const duplicate = addNote('trip', 'A different body.', notesFile);
	assert.deepEqual(duplicate, { success: false, message: 'Note already exists' });
	assert.deepEqual(listNotes(notesFile), ['Trip']);

	assert.deepEqual(removeNote('TRIP', notesFile), { success: true, note: added.note });
	assert.deepEqual(listNotes(notesFile), []);
	assert.equal(readNote('Trip', notesFile), null);
	assert.deepEqual(removeNote('Missing', notesFile), { success: false, message: 'Note not found' });
});