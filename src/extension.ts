// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

function eol_from_from_pos(doc: vscode.TextDocument, pos: vscode.Position) {
	return doc.lineAt(pos).range.end;
}

function soft_bol_from_pos(doc: vscode.TextDocument, pos: vscode.Position) {
	const line = doc.lineAt(pos);
	const soft_bol = line.firstNonWhitespaceCharacterIndex;
	return (pos.character <= soft_bol && pos.character > 0) ? line.range.start : new vscode.Position(pos.line, soft_bol);
}

function move_selection_to_soft_bol(doc: vscode.TextDocument, s: vscode.Selection, extend: boolean) {
	const new_active = soft_bol_from_pos(doc, s.active);
	const new_anchor = (extend) ? s.anchor : new_active;
	return new vscode.Selection(new_anchor, new_active);
}

function move_to_soft_bol(editor: vscode.TextEditor, extend: boolean) {
	editor.selections = editor.selections.map(s => move_selection_to_soft_bol(editor.document, s, extend));
}

function moveToSoftBolNoExtend(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
	move_to_soft_bol(editor, false);
}

function moveToSoftBolExtend(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
	move_to_soft_bol(editor, true);
}

function deleteToSoftBol(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
	editor.selections.forEach(s => {
		var new_active = soft_bol_from_pos(editor.document, s.active);
		edit.delete(new vscode.Selection(s.anchor, new_active));
	});
}

function deleteSoftBolToEol(editor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
	editor.selections.forEach(s => {
		var new_active = soft_bol_from_pos(editor.document, s.active);
		var new_anchor = eol_from_from_pos(editor.document, s.anchor);
		edit.delete(new vscode.Selection(new_anchor, new_active));
	});
}

interface VanillaCommand {
	name: string;
	func: (p1: vscode.TextEditor, p2: vscode.TextEditorEdit) => void;
}

function register_commands(extension_id: string, context: vscode.ExtensionContext, ze_list: VanillaCommand[]) {
	ze_list.forEach(z => vscode.commands.registerTextEditorCommand(extension_id + '.' + z.name, z.func));
}

export function activate(context: vscode.ExtensionContext) {
	register_commands(
		'karmchenki-soft-bol',
		context,
		[
			{ name: 'moveToSoftBolNoExtend', func: moveToSoftBolNoExtend },
			{ name: 'moveToSoftBolExtend', func: moveToSoftBolExtend },
			{ name: 'deleteToSoftBol', func: deleteToSoftBol },
			{ name: 'deleteSoftBolToEol', func: deleteSoftBolToEol }
		]
	);
}

export function deactivate() { }
