const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

class CicodeFunctionList {
	constructor(workspaceRoot, projects) {
    this.workspaceRoot = workspaceRoot;
    this.projects = projects;
    this._onDidChangeTreeData = new vscode.EventEmitter();
	  this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    this.fillTree();
	}

  fillTree() {
    this.cicodeItems = [];
    for(const project of this.projects) {
      const projectPath = path.join(this.workspaceRoot, project);
      const files = fs.readdirSync(projectPath);
      const cicodeFiles = files.filter(file => path.extname(file) === '.ci');
      for(const fileName of cicodeFiles) {
        const filePath = path.join(projectPath, fileName);
        const f = fs.readFileSync(filePath, {encoding: 'latin1'});
        const re = /^(INT|STRING|REAL)?\s*FUNCTION (\w*)\((.*)\)$/gm;
        const fileFunctions = [...f.matchAll(re)];
        this.cicodeItems.push({
          fileProject: project,
          filePath: filePath,
          fileName: fileName,
          functions: fileFunctions,
        });
      }
    }
  }

  provideDefinition(textDocument, position, token) {

    return new Promise((resolve) => {
        console.log(textDocument, token);
        console.log(position);
        console.log(Location(Uri.parse(''), position));
        return new Location(Uri.parse(''), position);
    });
  }

  refresh() {
    this.fillTree();
    this._onDidChangeTreeData.fire();
  }

	getTreeItem(element) {
		return element;
	}

  getChildren(element) {
    return this.getFunctions();
  }

  getFunctions() {
    const cicodeFunctionsItems = [];
    for(const item of this.cicodeItems) {
      for(const func of item.functions) {
        cicodeFunctionsItems.push(
          new CicodeFunction({
            type: func[1],
            name: func[2],
            args: func[3],
            fileProject: item.fileProject,
            fileName: item.fileName,
            filePath: item.filePath,
            position: func.index,
          }
        ));
      }
    }
    const sortedFunctions = cicodeFunctionsItems.sort((a, b) => (a.label).localeCompare(b.label))
    return sortedFunctions;
  }
}
exports.CicodeFunctionList = CicodeFunctionList;

class CicodeFunction extends vscode.TreeItem {
	constructor({
    type,
		name,
    args,
    fileProject,
    fileName,
    filePath,
    position,
  }) {
		super(name, vscode.TreeItemCollapsibleState.None);
		this.tooltip = args;
    this.args = args;
		this.description = type;
    this.fileProject = fileProject;
    this.command = {
      title: '',
      command: 'cicodeHelp.revealFunction',
      arguments: [type, name, args, fileProject, fileName, filePath, position]
    };
	}
}