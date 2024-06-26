import * as vscode from "vscode";
import {
  ComponentType,
  CreateComponentFactory,
  CreateModuleFactory,
} from "./file-factory";
import * as path from "path";
import { COMPONENTS, CREATE_TYPE, FORM_TIP, TABLE_TIP } from "./const";
import { ConfirmModal, StaticModal } from "./code-factory";

// vsc 的命令行所有操作均放到这里,命令行逻辑控制
export function commandControl(context: vscode.ExtensionContext) {
  // 注册文件树右键菜单命令
  registerVscFoldMenu().forEach((item) => {
    context.subscriptions.push(item);
  });

  // 注册代码块右键菜单命令
  registerVscCodeMenu().forEach((item) => {
    context.subscriptions.push(item);
  });
}

/**
 * @description 这里注册 vsc 代码块右键菜单命令
 * @returns
 */
function registerVscCodeMenu() {
  const createConfirmModal = vscode.commands.registerCommand(
    "create.confirmModal",
    async (resource: vscode.Uri) => {
      let targetFolder: string = getFilePath(resource);
      createConfirmModalTpl(targetFolder);
    }
  );
  const staticModal = vscode.commands.registerCommand(
    "create.staticModal",
    async (resource: vscode.Uri) => {
      let targetFolder: string = getFilePath(resource);
      createStaticModalTpl(targetFolder);
    }
  );
  return [createConfirmModal, staticModal];
}

/**
 * @description 这里注册 vsc 文件菜单命令
 * @returns
 */
function registerVscFoldMenu() {
  const vscCreateFile = vscode.commands.registerCommand(
    "extension.createFile",
    async (resource: vscode.Uri) => {
      let targetFolder: string = getFilePath(resource);
      const fileType = await callVscSelect(CREATE_TYPE, "选择创建的类型");

      if (!fileType) {
        return;
      }
      switch (fileType) {
        case "Component": {
          createComponentFlow(targetFolder);
          formatterTypeScript(targetFolder);
          break;
        }
        case "Module": {
          createModuleFlow(targetFolder);
          break;
        }
      }
    }
  );
  return [vscCreateFile];
}

/**
 * @description 创建确认弹窗
 */
async function createConfirmModalTpl(path: string) {
  let templateKey = "";
  const isCustom = await callVscSelect(["否", "是"], "是否自定义弹窗模版");
  if (!isCustom) {
    return;
  }
  if (isCustom === "是") {
    templateKey = await callVscInput("请输入模版键名");
  }
  if (isCustom === "是" && templateKey === "") return;

  const confirmModalInstance = new ConfirmModal(
    path,
    "",
    isCustom,
    templateKey
  );
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor
      .edit((editBuilder) => {
        editBuilder.replace(
          activeTextEditor.selection,
          confirmModalInstance.getModalTemplate()
        );
      })
      .then(async () => {
        // 这里不知道为啥,需要重新打开文件保存后才能再次写入
        const document = await vscode.workspace.openTextDocument(path);
        await vscode.window.showTextDocument(document);
        await document.save();
        confirmModalInstance.build();
        formatterTypeScript(path);
        callVscModal("已成功创建弹窗模版");
      });
  }
}
/**
 * @description 创建 delon 组件弹窗
 * @param path 
 */
async function createStaticModalTpl(path: string) {
  let componentName = await callVscInput("请输入弹窗组件名");
  const confirmModalInstance = new StaticModal(
    path,
    "",
    componentName
  );
  const { activeTextEditor } = vscode.window;
  if (activeTextEditor) {
    activeTextEditor
      .edit((editBuilder) => {
        editBuilder.replace(
          activeTextEditor.selection,
          confirmModalInstance.getModalTemplate()
        );
      })
      .then(async () => {
        // 这里不知道为啥,需要重新打开文件保存后才能再次写入
        const document = await vscode.workspace.openTextDocument(path);
        await vscode.window.showTextDocument(document);
        await document.save();
        confirmModalInstance.build();
        formatterTypeScript(path);
        callVscModal("已成功创建弹窗模版");
      });
  }
}

/**
 * @description 格式化组件文件
 * @param createPath
 */
function formatterTypeScript(createPath: string) {
  let formatterListen = vscode.workspace.onDidOpenTextDocument((document) => {
    if (
      !document.uri.fsPath.includes(createPath) ||
      !document.uri.fsPath.includes("component.ts")
    )
      return;
    vscode.commands.executeCommand("editor.action.formatDocument");
    formatterListen.dispose();
  });
}

/**
 * @description 创建模块流程
 * @param targetFolder 文件基本路径
 * @returns
 */
async function createModuleFlow(targetFolder: string) {
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
  const isNeedShareModule = await callVscSelect(
    ["否", "是"],
    "是否需要引入 share module"
  );
  if (!isCreateRouteModule) {
    return;
  }
  // 模块路径
  const foldPath = path.join(targetFolder, name as string);
  new CreateModuleFactory(foldPath, name, { isCreateRouteModule, isNeedShareModule }).build();
  callVscModal(`模块 ${name} 成功创建`);
}

/**
 * @description 创建组件流程
 * @param targetFolder
 * @returns
 */
async function createComponentFlow(targetFolder: string) {
  const name = await callVscInput("请输入组件命名");
  if (!name) {
    return;
  }
  const createComponentType = (await callVscSelect(
    COMPONENTS,
    "创建组件类型"
  )) as ComponentType;
  let sfSetting, stSetting, isShowPageHeader;
  if (!createComponentType) {
    return;
  }
  if (createComponentType === "表单表格搜索组件") {
    isShowPageHeader = await callVscSelect(["否", "是"], "是否需要 pageHeader");
  }
  switch (createComponentType) {
    case "空": {
      break;
    }
    case "表单表格搜索组件": {
      sfSetting = await callVscInput(FORM_TIP);
      stSetting = await callVscInput(TABLE_TIP);
      break;
    }
    case "表格": {
      stSetting = await callVscInput(TABLE_TIP);
      break;
    }
    case "表单": {
      sfSetting = await callVscInput(FORM_TIP);
      break;
    }
  }
  const isAutoDeclaration = await callVscSelect(
    ["否", "是"],
    "是否自动将该组件声明至上层模块"
  );
  if (!isAutoDeclaration) {
    return;
  }
  // 组件路径
  new CreateComponentFactory(targetFolder, name, {
    isAutoDeclaration,
    createComponentType,
    isShowPageHeader: isShowPageHeader === "是",
    sfSetting,
    stSetting,
  }).build();
  callVscModal(`组件 ${name} 成功创建`);
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

/**
 * @description vsc 提示弹窗
 * @param text
 */
function callVscModal(text: string) {
  vscode.window.showInformationMessage(text);
}
