import * as vscode from "vscode";
import {
  ComponentType,
  CreateComponentFactory,
  CreateModuleFactory,
} from "../factory";
import * as path from "path";
import { getSetting } from "../utils";

// vsc 的命令行所有操作均放到这里,命令行逻辑发生的地方
export function commandControl(context: vscode.ExtensionContext) {
  let createPath = "";
  let disposable = vscode.commands.registerCommand(
    "extension.createFile",
    async (resource: vscode.Uri) => {
      let targetFolder: string = getFilePath(resource);
      createPath = targetFolder;
      const fileType = await callVscSelect(
        ["Module", "Component"],
        "选择创建的类型"
      );

      if (!fileType) {
        return;
      }
      switch (fileType) {
        case "Component": {
          createComponent(targetFolder);
          formatterComponent(createPath)
          break;
        }
        case "Module": {
          createModule(targetFolder);
          break;
        }
      }
    }
  );
  context.subscriptions.push(disposable);
}

/**
 * @description 格式化组件文件
 * @param createPath 
 */
function formatterComponent(createPath:string) {
  let formatterListen = // 监听文件打开事件
    vscode.workspace.onDidOpenTextDocument((document) => {
      if (!document.uri.fsPath.includes(createPath)) return;
      if (!document.uri.fsPath.includes("component.ts")) return;
      vscode.commands.executeCommand("editor.action.formatDocument");
      formatterListen.dispose();
    });
}

/**
 * @description 创建模块
 * @param targetFolder 文件基本路径
 * @returns
 */
async function createModule(targetFolder: string) {
  const name = await callVscInput("请输入模块命名");
  if (!name) {
    return;
  }
  const isCreateRouteModule = await callVscSelect(
    ["是", "否"],
    "是否创建路由模块"
  );
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
  const name = await callVscInput("请输入组件命名");
  if (!name) {
    return;
  }
  const createComponentType = (await callVscSelect(
    ["空", "表单表格搜索组件", "表格", "表单"],
    "创建组件类型"
  )) as ComponentType;
  let sfSetting, stSetting, isShowPageHeader;
  if (!createComponentType) {
    return;
  }
  if (createComponentType !== "空") {
    isShowPageHeader = await callVscSelect(["否", "是"], "是否需要 pageHeader");
  }
  switch (createComponentType) {
    case "空": {
      break;
    }
    case "表单表格搜索组件": {
      sfSetting = await callVscInput(
        "请输入表单配置,规则 (title,key),圆括号代表每一个 schema 的基本配置"
      );
      stSetting = await callVscInput(
        "请输入 table 配置,规则 (title,index),圆括号代表每一个表格列配置"
      );
      break;
    }
    case "表格": {
      stSetting = await callVscInput(
        "请输入 table 配置,规则 (title,index),圆括号代表每一个表格列配置"
      );
      break;
    }
    case "表单": {
      sfSetting = await callVscInput(
        "请输入表单配置,规则 (title,key),圆括号代表每一个 schema 的基本配置"
      );
      break;
    }
  }
  sfSetting = getSetting(sfSetting || "");
  stSetting = getSetting(stSetting || "");
  const isAutoDeclaration = await callVscSelect(
    ["否", "是"],
    "是否自动声明至上层模块"
  );
  if (!isAutoDeclaration) {
    return;
  }
  // 模块路径
  new CreateComponentFactory(targetFolder, name, {
    isAutoDeclaration,
    createComponentType,
    isShowPageHeader: isShowPageHeader === "是",
    sfSetting,
    stSetting,
  }).create();
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
  if (
    vscode.workspace.workspaceFolders &&
    vscode.workspace.workspaceFolders.length > 0
  ) {
    // 如果没有右键点击资源管理器中的文件夹，则使用第一个工作区的路径
    return vscode.workspace.workspaceFolders[0].uri.fsPath;
  }
  return "";
}

/**
 * @description 唤起 vsc 输入框
 * @param prompt  输入框提示词
 * @returns
 */
function callVscInput<T>(prompt: T): Promise<T> {
  return new Promise((resolve) => {
    vscode.window
      .showInputBox({ prompt: prompt as string, ignoreFocusOut: true })
      .then((res) => [resolve(res as T)]);
  });
}

/**
 * @description 唤起 vsc 选择框
 * @param selectEnum 选择框下拉内容
 * @param placeHolder 选择框提示词
 * @returns
 */
function callVscSelect(
  selectEnum: string[],
  placeHolder: string
): Promise<string> {
  return new Promise((resolve) => {
    vscode.window.showQuickPick(selectEnum, { placeHolder }).then((res) => {
      resolve(res as string);
    });
  });
}
