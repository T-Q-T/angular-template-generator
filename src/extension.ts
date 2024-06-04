import * as vscode from 'vscode';
import { commandControl } from './control';


export function activate(context: vscode.ExtensionContext) {
    commandControl(context)
}



export function deactivate() { }
