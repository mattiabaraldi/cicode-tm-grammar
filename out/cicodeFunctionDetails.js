const vscode = require('vscode');

class CicodeFunctionDetails {
	constructor() {
    this._onDidChangeTreeData = new vscode.EventEmitter();
	  this.onDidChangeTreeData = this._onDidChangeTreeData.event;
	}

  refresh(item) {
    this.item = item;
    this._onDidChangeTreeData.fire();
  }

	getTreeItem(element) {
		return element;
	}

  getChildren(element) {
    return this.getArguments();
  }

  getArguments() {
    if(!this.item) return [];

    const argItems = [];
    if(this.item.fileProject != '') argItems.push(new CicodeInfo({label: `Project: ${this.item.fileProject}`}))
    argItems.push(
      new CicodeInfo({label: `File: ${this.item.fileName}`}),
      new CicodeInfo({label: `Function: ${this.item.name}`}),
      new CicodeInfo({label: `Type: ${this.item.type !== undefined ? this.item.type : 'VOID'}`}),
      new CicodeInfo({label: 'Go to function', description: '-->',
        cmd: {
          filePath: this.item.filePath,
          position: this.item.position
        }
      }),
    );

    const reBracket = /(\(.*)(\,)(.*\))/g;
    const reQuote = /(".*)(\,)(.*")/g;
    let sanitizedCicodeFunctions = this.item.args.replaceAll(reBracket, '$1§$3');
    sanitizedCicodeFunctions = sanitizedCicodeFunctions.replaceAll(reQuote, '$1§$3');

    if(sanitizedCicodeFunctions !== '') {
      const argList = sanitizedCicodeFunctions.split(',');
      argList.forEach((element, index) => {
        argList[index] = element.replaceAll('§', ',');
      });
      argItems.push(new CicodeInfo());
      argItems.push(new CicodeInfo({label: 'Arguments:'}));
      for(const arg of argList) {
        argItems.push(new CicodeArgument(arg));
      }
    }
    
    return argItems;
  }

  goToFunction(file, line) {
    vscode.workspace.openTextDocument(file)
    .then(document => {
      vscode.window.showTextDocument(document)
      .then(() => {
        let activeEditor = vscode.window.activeTextEditor;
        let pos = activeEditor.document.positionAt(line);
        activeEditor.selection =  new vscode.Selection(pos, pos);
        activeEditor.revealRange(new vscode.Range(pos, pos), vscode.NotebookEditorRevealType.AtTop);
      });
    });
  }
}
exports.CicodeFunctionDetails = CicodeFunctionDetails;

class CicodeInfo extends vscode.TreeItem {
	constructor({
    label = '',
    description = '',
    cmd
  } = {}) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = description;
    
    if(cmd) {
      this.command = {
        title: '',
        command: 'cicodeHelp.goToFunction',
        arguments: [cmd.filePath, cmd.position]
      };
    }
	}
}

class CicodeArgument extends vscode.TreeItem {
	constructor(arg) {
    const argSplit = arg.split('=');
    const argBase = argSplit[0].trim();
    const argDefault = argSplit.length > 1 ? argSplit[1] : '';
    super(argBase, vscode.TreeItemCollapsibleState.None);
    this.description = argDefault;
	}
}