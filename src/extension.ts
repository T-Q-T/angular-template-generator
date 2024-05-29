import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { getComponentTemplate, getModuleTemplate, getRouteModuleTemplate, getServiceTemplate } from './utils';
import { CreateComponentFactory, CreateModuleFactory } from './factory';



export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('extension.createFile', async (resource: vscode.Uri) => {
        let targetFolder: string = getFilePath(resource);

        const fileType = await vscode.window.showQuickPick(['Module', 'Component'], { placeHolder: '选择创建的类型' });

        if (!fileType) {
            return;
        }
        switch (fileType) {
            case 'Component': {
                createComponent(targetFolder)
                break
            }
            case 'Module': {
                createModule(targetFolder);
                break
            }
        }

    });
    context.subscriptions.push(disposable);
}

/**
 * @description 创建模块
 * @param targetFolder 文件基本路径
 * @returns 
 */
async function createModule(targetFolder: string) {
    const name = await vscode.window.showInputBox({ prompt: '请输入模块命名' });
    if (!name) {
        return;
    }
    const isCreateRouteModule = await vscode.window.showQuickPick(['是', '否'], { placeHolder: '是否创建路由模块' });
    if (!isCreateRouteModule) {
        return;
    }
    // 模块路径
    const foldPath = path.join(targetFolder, name as string);
    new CreateModuleFactory(foldPath, name, { isCreateRouteModule }).create();
    vscode.window.showInformationMessage(`模块 ${name} 成功创建`);
}

/**
 * @description 创建组件
 * @param targetFolder 
 * @returns 
 */
async function createComponent(targetFolder: string) {
    const name = await vscode.window.showInputBox({ prompt: '请输入组件命名' });
    if (!name) {
        return;
    }
    const isAutoDeclaration = await vscode.window.showQuickPick(['否', '是'], { placeHolder: '是否自动声明至上层模块' });
    if (!isAutoDeclaration) {
        return;
    }
    // 模块路径
    new CreateComponentFactory(targetFolder, name, { isAutoDeclaration }).create();
    vscode.window.showInformationMessage(`模块 ${name} 成功创建`);
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
