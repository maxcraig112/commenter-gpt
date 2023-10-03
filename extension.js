// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { OpenAI } = require("openai");




// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	async function runCompletion (prompt) {
		const api = new OpenAI({
			apiKey: retrieveUserData("APIKey",context)
		});
		
		const completion = await api.chat.completions.create({
		model: "gpt-3.5-turbo",
		messages: [{"role": "user", "content": prompt}],
		max_tokens:2000
	});
    return completion.choices[0].message.content;
}

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "commenter-gpt" is now active!');

	function saveUserData(key, value, context) {
		const userData = { ...(context.globalState.get('userData') || {}), [key]: value };
		context.globalState.update('userData', userData);
	}
	
	function retrieveUserData(key, context) {
		const userData = context.globalState.get('userData') || {};
		return key ? userData[key] : userData;
	}

	context.subscriptions.push(vscode.commands.registerCommand('commenter-gpt.addAPIKey', () => {
        vscode.window.showInputBox({
            prompt: 'Enter your API key:',
            placeHolder: `${retrieveUserData("APIKey",context)}`,
        }).then(apiKey => {
            if (apiKey) {
				saveUserData("APIKey",apiKey,context)
                vscode.window.showInformationMessage(`API Key ${retrieveUserData("APIKey",context)} has been stored.`);
            }
			else{
                vscode.window.showInformationMessage('No API Key Provided');
			}
        });
    }));

	context.subscriptions.push(
        vscode.commands.registerCommand('comment-gpt.addDocstring', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
				if (retrieveUserData("APIKey",context) != undefined){
					const selectedCode = editor.document.getText(editor.selection);
                	const editBuilder = new vscode.WorkspaceEdit();
					const newText = await runCompletion("Add docstrings to the following code provided, include a description, args, returns, don't include any explanations other than in the code in your response: " + selectedCode)
                	editBuilder.replace(editor.document.uri, editor.selection,newText.replace(/^```python\s*/, '').replace(/\s*```$/, ''));

                	// Apply the edit to the editor
                	vscode.workspace.applyEdit(editBuilder);
				}
				else{
					vscode.window.showErrorMessage("API Key not provided");
				}
            }
        })
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('comment-gpt.addInlineComments', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
				if (retrieveUserData("APIKey",context) != undefined){
					const selectedCode = editor.document.getText(editor.selection);
                	const editBuilder = new vscode.WorkspaceEdit();
					const newText = await runCompletion("Add inline comments to the following code provided, don't include any explanations other than in the code in your response: " + selectedCode)
                	editBuilder.replace(editor.document.uri, editor.selection,newText.replace(/^```python\s*/, '').replace(/\s*```$/, ''));

                	// Apply the edit to the editor
                	vscode.workspace.applyEdit(editBuilder);
				}
				else{
					vscode.window.showErrorMessage("API Key not provided");
				}
            }
        })
    );

	context.subscriptions.push(
        vscode.commands.registerCommand('comment-gpt.addInlineandDocstring', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
				if (retrieveUserData("APIKey",context) != undefined){
					const selectedCode = editor.document.getText(editor.selection);
                	const editBuilder = new vscode.WorkspaceEdit();
					const newText = await runCompletion("Add docstrings and inline comments to the following code provided, include a description, args, returns in the docstrings. don't include any explanations other than in the code in your response: " + selectedCode)
                	editBuilder.replace(editor.document.uri, editor.selection,newText.replace(/^```python\s*/, '').replace(/\s*```$/, ''));

                	// Apply the edit to the editor
                	vscode.workspace.applyEdit(editBuilder);
				}
				else{
					vscode.window.showErrorMessage("API Key not provided");
				}
            }
        })
    );

}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
