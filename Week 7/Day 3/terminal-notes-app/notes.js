const fs = require('node:fs');
const path = require('node:path');
const _ = require('lodash');

const NOTES_FILE = path.join(__dirname, 'notes.json');

function loadNotes(filePath = NOTES_FILE) {
	if (!fs.existsSync(filePath)) return [];
	const contents = fs.readFileSync(filePath, 'utf8');
	if (!contents.trim()) return [];

	const notes = JSON.parse(contents);
	if (!Array.isArray(notes)) {
		throw new Error('Notes file must contain a JSON array.');
	}
	return notes;
}

function saveNotes(notes, filePath = NOTES_FILE) {
	fs.writeFileSync(filePath, `${JSON.stringify(notes, null, 2)}\n`, 'utf8');
}

function findNoteIndex(notes, title) {
	const normalizedTitle = title.trim().toLowerCase();
	return _.findIndex(notes, (note) => note.title.trim().toLowerCase() === normalizedTitle);
}

function addNote(title, body, filePath = NOTES_FILE) {
	if (typeof title !== 'string' || !title.trim() || typeof body !== 'string' || !body.trim()) {
		return { success: false, message: 'Both title and body are required.' };
	}

	const notes = loadNotes(filePath);
	if (findNoteIndex(notes, title) !== -1) {
		return { success: false, message: 'Note already exists' };
	}

	const note = { title: title.trim(), body: body.trim(), createdAt: new Date().toISOString() };
	notes.push(note);
	saveNotes(notes, filePath);
	return { success: true, note };
}

function listNotes(filePath = NOTES_FILE) {
	return loadNotes(filePath).map((note) => note.title);
}

function readNote(title, filePath = NOTES_FILE) {
	const notes = loadNotes(filePath);
	const index = findNoteIndex(notes, title);
	return index === -1 ? null : notes[index];
}

function removeNote(title, filePath = NOTES_FILE) {
	const notes = loadNotes(filePath);
	const index = findNoteIndex(notes, title);
	if (index === -1) return { success: false, message: 'Note not found' };

	const [note] = notes.splice(index, 1);
	saveNotes(notes, filePath);
	return { success: true, note };
}

module.exports = { addNote, listNotes, readNote, removeNote, loadNotes };