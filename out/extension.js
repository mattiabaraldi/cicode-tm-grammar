// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
//import * as vscode from 'vscode';
//import { CicodeFunctionList } from './cicodeFunctionList';

const vscode = require('vscode');
const CicodeFunctionList = require('./cicodeFunctionList').CicodeFunctionList;
const CicodeFunctionDetails = require('./cicodeFunctionDetails').CicodeFunctionDetails;
const fs = require('fs');
const path = require('path');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "helloworld-sample" is now active!');

  const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

  const settingsPath = path.join(rootPath, '.vscicode');
  let projects = [];
  if (fs.existsSync(settingsPath)) {
    const settingsFile = fs.readFileSync(settingsPath, { encoding: 'utf8', flag: 'r' });
    projects = settingsFile.split(/\r?\n/);
    projects = projects.filter(project => fs.existsSync(path.join(rootPath, project)));
  }
  if(projects.length == 0) projects = [''];
  

  const cicodeFunctionListProvider = new CicodeFunctionList(rootPath, projects);
  //vscode.window.registerTreeDataProvider('cicodeHelp', cicodeFunctionListProvider);
  const cicodeFunctionListTreeView = vscode.window.createTreeView('cicodeHelp', {
    treeDataProvider: cicodeFunctionListProvider
  });

  const cicodeFunctionDetailsProvider = new CicodeFunctionDetails();
  //vscode.window.registerTreeDataProvider('cicodeHelp', cicodeFunctionListProvider);
  const cicodeFunctionDetailsTreeView = vscode.window.createTreeView('cicodeDetails', {
    treeDataProvider: cicodeFunctionDetailsProvider
  });
  //vscode.languages.registerDefinitionProvider('cicode', cicodeFunctionListProvider);

  vscode.commands.registerCommand('cicodeHelp.revealFunction', (type, name, args, fileProject, fileName, filePath, position) => {
    //cicodeFunctionDetailsTreeView.title = name + ' - ' + fileName;
    //cicodeFunctionDetailsTreeView.message = fileName;
    cicodeFunctionDetailsProvider.refresh({
      type: type,
      name: name,
      args: args,
      fileProject: fileProject,
      fileName: fileName,
      filePath: filePath,
      position: position,
    })
  });
  vscode.commands.registerCommand('cicodeHelp.goToFunction', (file, func) => cicodeFunctionDetailsProvider.goToFunction(file, func));
  vscode.commands.registerCommand('cicodeHelp.refreshEntry', () => cicodeFunctionListProvider.refresh());
  vscode.commands.registerCommand('cicodeHelp.findEntry', () => {
    vscode.commands.executeCommand("cicodeHelp.focus");
    vscode.commands.executeCommand('list.find');
  });

}
exports.activate = activate;