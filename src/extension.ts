import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createFile', async (resource: vscode.Uri) => {
        let targetFolder: string = getFilePath(resource);
        const name = await vscode.window.showInputBox({ prompt: '请输入模块命名' });
        if (!name) {
            return;
        }
        // 模块路径
        const modulePath = path.join(targetFolder, name as string);
        // 创建基本文件夹
        createBaseFolds(modulePath)
        // 创建基本文件
        createBaseFiles(modulePath)
        // 创建基本 html 文件
        createFile(path.join(targetFolder, name, `${name}.component.html`), '充实的一天,辛苦了')


        vscode.window.showInformationMessage(`模块 ${name} 成功创建`);
    });

    context.subscriptions.push(disposable);
}


/**
 * @description 创建基本文件夹
 * @param path 
 */
function createBaseFolds(modulePath: string) {
    const constPath = path.join(modulePath, 'const');
    const typePath = path.join(modulePath, 'type');
    const servicePath = path.join(modulePath, 'service');
    const utilsPath = path.join(modulePath, 'utils');
    // 文件夹数组
    const baseFoldArr = [modulePath, constPath, typePath, servicePath, utilsPath]
    // 创建模块文件夹
    baseFoldArr.forEach((item) => {
        createFold(item)
    })

}

/**
 * @description 创建基本文件
 * @param modulePath 
 */
function createBaseFiles(modulePath: string) {
    const constPath = path.join(modulePath, 'const', 'index.ts')
    const typePath = path.join(modulePath, 'type', 'index.ts');
    const utilsPath = path.join(modulePath, 'utils', 'index.ts');
    const baseFilesArr = [constPath, typePath, utilsPath]
    baseFilesArr.forEach((item) => {
        createFile(item, '')
    })
}

/**
 * @description 创建单个文件
 */
function createFile(filePath: string, content: string) {
    try {
        fs.writeFileSync(filePath, content)
    } catch (err) {
        vscode.window.showErrorMessage(`Error creating file: ${err}`);
    }
}



/**
 * @description 创建模块文件夹
 * @param path 
 */
function createFold(path: string) {
    try {
        fs.mkdirSync(path);
    } catch (err) {
        vscode.window.showErrorMessage(`Error creating folder: ${err}`);
    }
}

/**
 * @description 获取右键创建时的文件路径
 * @param resource 
 * @returns 
 */
function getFilePath(resource: vscode.Uri) {
    if (resource && resource.fsPath) {
        // 如果右键点击了资源管理器中的文件夹，则使用该文件夹的路径
        return resource.fsPath;
    }
    if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
        // 如果没有右键点击资源管理器中的文件夹，则使用第一个工作区的路径
        return vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    return ''
}

















export function deactivate() { }
