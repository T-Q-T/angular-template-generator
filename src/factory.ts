import * as fs from "fs";
import * as path from "path";
import {
  shallowFilterObjUndefinedProperty,
  firstLetterCamelCaseFormatter,
  removeQuotesFromKeys,
  newGetSetting,
} from "./utils";
import {
  getBaseTs,
  getBaseHtml,
  getFormTs,
  getFormTableTs,
  getFormTableHtml,
  getFormHtml,
  getModuleTemplate,
  getPipeTemplate,
  getRouteModuleTemplate,
  getServiceTemplate,
  getTableHtml,
  getTableTs,
} from "./template";

// 组件/模块等文件创建工厂

export type ComponentType = "空" | "表单表格搜索组件" | "表格" | "表单";
export interface ComponentOption {
  isAutoDeclaration: string;
  createComponentType: ComponentType;
  isShowPageHeader: boolean;
  stSetting: string;
  sfSetting: string;
}
type SchemaAny = any;

type ColumnAny = any;

type ComponentMap = { [key in ComponentType]: any };

type ComponentClass =
  | TableComponent
  | Component
  | FormComponent
  | FormTableComponent;

/**
 * @description 文件基本操作类
 */
export class FileFactory {
  constructor(basePath: string, name: string) {
    this.basePath = basePath;
    this.name = name;
  }

  public basePath!: string;
  public name!: string;

  /**
   * @description 创建单个文件
   */
  createFile(filePath: string, content: string) {
    try {
      fs.writeFileSync(filePath, content);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @description 创建模块文件夹
   * @param path
   */
  createFold(path: string) {
    try {
      fs.mkdirSync(path);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @description 读取文件内容
   * @param path
   */
  readFile(path: string) {
    let data: string = "";
    try {
      data = fs.readFileSync(path, "utf8");
    } catch (err) {
      console.error("读取文件时出错：", err);
    }
    return data;
  }
}

/**
 * 派遣分发组件类
 */
class DispatchComponent {
  constructor(type: ComponentType) {
    this.type = type;
  }
  type: ComponentType;
  map: ComponentMap = {
    空: Component,
    表单: FormComponent,
    表格: TableComponent,
    表单表格搜索组件: FormTableComponent,
  };
  get() {
    return this.map[this.type as ComponentType];
  }
}

/**
 * @description 基本组件类
 */
class Component {
  constructor(name: string, data: Partial<ComponentOption>) {
    this.name = name;
    this.data = data;
  }
  data!: Partial<ComponentOption>;
  html!: string;
  ts!: string;
  scss!: string;
  name!: string;
  setHtmlTpl() {
    this.html = getBaseHtml(this.name);
  }
  setScssTpl() {
    this.scss = "::ng-deep{}";
  }
  setTsTpl() {
    this.ts = getBaseTs(this.name as string);
  }
  // 构建组件基本信息
  build() {
    this.setHtmlTpl();
    this.setScssTpl();
    this.setTsTpl();
    return this;
  }
}

/**
 * 表单组件类
 */
class FormComponent extends Component {
  constructor(name: string, data: Partial<ComponentOption>) {
    super(name, data);
  }
  /**
   * @description 构建 schema 基本数据
   * @returns
   */
  buildSfData() {
    if (!this.data.sfSetting) return;
    let setting = newGetSetting(this.data.sfSetting);
    const result: SchemaAny = { properties: {} };
    setting?.forEach((item, index) => {
      const { title, widget, schemaEnum, key } = item;
      const res: any = {
        title,
        enum: schemaEnum.length?schemaEnum:undefined,
        ui: widget && { widget },
      };
      result.properties[item.key] = shallowFilterObjUndefinedProperty(res);
    });
    return removeQuotesFromKeys(JSON.stringify(result));
  }

  override setHtmlTpl() {
    this.html=getFormHtml()
  }
  override setTsTpl() {
    this.ts=getFormTs(this.name,this.buildSfData())
  }
}
/**
 * 表格组件类
 */
class TableComponent extends Component {
  constructor(name: string, data: Partial<ComponentOption>) {
    super(name, data);
  }
  /**
   * @description 构建 column 基本数据
   */
  buildStData() {
    if (!this.data.stSetting) return;
    let setting = newGetSetting(this.data.stSetting);
    let result: ColumnAny = setting?.map((item,index) => {
      const { title, key } = item;
      let res:any={
        title: title,
        index: key,
      };
      if(index===0){
        // 默认固定 table 第一列
        res.fixed= 'left'
        res.width=100
      }
      return  res
    });
    // 默认帮忙填写 table 操作项
    result.push({
      fixed: 'right',
      width: 200,
      title: '操作',
      buttons: []
    })
    return removeQuotesFromKeys(JSON.stringify(result));
  }
  override setHtmlTpl() {
    this.html=getTableHtml()
  }
  override setTsTpl() {
    this.ts=getTableTs(this.name,this.buildStData())
  }
}
/**
 * 表单表格组件类
 */
class FormTableComponent extends Component {
  constructor(name: string, data: Partial<ComponentOption>) {
    super(name, data);
    //TODO 继承属性,继承方式比较 low 待优化
    this.stData = new TableComponent(name, data).buildStData.call(
      this
    ) as string;
    this.sfData = new FormComponent(name, data).buildSfData.call(
      this
    ) as string;
  }

  stData!: string;
  sfData!: string;

  override setHtmlTpl() {
    this.html = getFormTableHtml(this.data.isShowPageHeader);
  }
  override setTsTpl() {
    this.ts = getFormTableTs(
      this.name,
      this.sfData,
      this.stData
    );
  }
}

/**
 * @description 组件构造工厂
 */
export class CreateComponentFactory extends FileFactory {
  constructor(basePath: string, name: string, opt: Partial<ComponentOption>) {
    super(basePath, name);
    this.isAutoDeclaration = opt?.isAutoDeclaration;
    this.createComponentType = opt.createComponentType;
    this.isShowPageHeader = opt.isShowPageHeader;
    this.sfSetting = opt.sfSetting;
    this.stSetting = opt.stSetting;
  }
  private isAutoDeclaration?: string;
  private createComponentType?: ComponentType;
  private isShowPageHeader?: boolean;
  private stSetting?: string;
  private sfSetting?: string;

  /**
   * @description 查找父级 module.ts 文件
   * @param folderPath
   * @returns
   */
  private async findModuleFile(folderPath: string): Promise<string | null> {
    let currentPath = folderPath;

    // 如果传入的是文件路径，则转换为其所在的文件夹路径
    if (
      !fs.existsSync(currentPath) ||
      !fs.statSync(currentPath).isDirectory()
    ) {
      currentPath = path.dirname(folderPath);
    }
    while (currentPath !== path.dirname(currentPath)) {
      const files = fs.readdirSync(currentPath);
      const moduleFile = files.find(
        (file) =>
          file.includes("module.ts") && !file.includes("route.module.ts")
      );
      if (moduleFile) {
        return path.join(currentPath, moduleFile);
      }

      currentPath = path.dirname(currentPath);
    }

    return null;
  }

  /**
   * @description 更新最近父级模块声明
   */
  private async updateParentModuleDeclaration() {
    try {
      const basePath = path.join(this.basePath, `${this.name}.component.ts`);
      const parentModulePath = await this.findModuleFile(basePath);
      let content = this.readFile(parentModulePath as unknown as string);
      let newContent = content;
      const regex = /(declarations:\s*\[[^\]]*?\])/s;
      const match = content.match(regex);
      const CamelCase = firstLetterCamelCaseFormatter(this.name);
      if (match) {
        const updatedContent = match[1].replace(
          /\]$/,
          `, ${CamelCase}Component]`
        );
        newContent = content.replace(match[1], updatedContent);
        newContent = `import { ${CamelCase}Component } from './components/${this.name}/${this.name}.component';\n${newContent}`;
      }
      this.createFile(parentModulePath as unknown as string, newContent);
    } catch (err) {
      console.error(err);
    }
  }

  /**
   * @description 创建基本的 scss 模版
   * @param name
   * @param modulePath
   */
  private createScssTpl(scss: string) {
    this.createFile(
      path.join(this.basePath, this.name, `${this.name}.component.scss`),
      scss
    );
  }

  /**
   * @description 创建组件文件夹
   */
  private createComponentFolder() {
    this.createFold(path.join(this.basePath, this.name));
  }

  /**
   * @description 创建基本 html 文件
   * @param name
   * @param modulePath
   */
  private createHtmlTpl(html: string) {
    this.createFile(
      path.join(this.basePath, this.name, `${this.name}.component.html`),
      html
    );
  }

  /**
   * @description 创建基本组件 ts 模版
   * @param name
   * @param modulePath
   */
  private createTsTpl(ts: string) {
    this.createFile(
      path.join(this.basePath, this.name, `${this.name}.component.ts`),
      ts
    );
  }

  /**
   * @description 创建组件文件
   * @param component
   */
  public creteComponent(component: ComponentClass) {
    this.createComponentFolder();
    this.createHtmlTpl(component.html);
    this.createScssTpl(component.scss);
    this.createTsTpl(component.ts);
    if (this.isAutoDeclaration === "是") {
      this.updateParentModuleDeclaration();
    }
  }

  /**
   * 入口
   */
  public build() {
    const componentClass = new DispatchComponent(
      this.createComponentType as ComponentType
    ).get();
    const componentInstance = new componentClass(this.name, {
      isAutoDeclaration: this.isAutoDeclaration,
      createComponentType: this.createComponentType,
      isShowPageHeader: this.isShowPageHeader,
      stSetting: this.stSetting,
      sfSetting: this.sfSetting,
    }).build();
    this.creteComponent(componentInstance);
  }
}

/**
 * @description 模块构造工厂
 */
export class CreateModuleFactory extends CreateComponentFactory {
  constructor(basePath: string, name: string, opt: any) {
    super(basePath, name, opt);
    this.isCreateRouteModule = opt.isCreateRouteModule;
  }

  isCreateRouteModule!: string;
  /**
   * @description 创建基本文件夹
   * @param path
   */
  createBaseFolds(modulePath: string) {
    const constPath = path.join(modulePath, "const");
    const typePath = path.join(modulePath, "type");
    const servicePath = path.join(modulePath, "service");
    const utilsPath = path.join(modulePath, "utils");
    const pipesPath = path.join(modulePath, "pipes");
    const componentsPath = path.join(modulePath, "components");
    // 文件夹数组
    const baseFoldArr = [
      modulePath,
      constPath,
      typePath,
      servicePath,
      utilsPath,
      pipesPath,
      componentsPath,
    ];
    // 创建模块文件夹
    baseFoldArr.forEach((item) => {
      this.createFold(item);
    });
  }

  /**
   * @description 创建基本文件
   * @param modulePath
   */
  createBaseFiles(modulePath: string) {
    const constPath = path.join(modulePath, "const", "index.ts");
    const typePath = path.join(modulePath, "type", "index.ts");
    const utilsPath = path.join(modulePath, "utils", "index.ts");
    const baseFilesArr = [constPath, typePath, utilsPath];
    baseFilesArr.forEach((item) => {
      this.createFile(item, "");
    });
  }

  /**
   * @description 创建服务模版
   * @param name
   * @param modulePath
   */
  createServiceTpl(name: string, modulePath: string) {
    const serviceContent = getServiceTemplate(name);
    this.createFile(
      path.join(modulePath, "service", `${name}.service.ts`),
      serviceContent
    );
  }

  /**
   * @description 创建基本模块 ts 模版
   * @param name
   * @param modulePath
   */
  createModuleTpl(
    name: string,
    modulePath: string,
    isCreateRouteModule: boolean = false
  ) {
    const moduleContent = getModuleTemplate(
      name as string,
      isCreateRouteModule
    );
    this.createFile(
      path.join(modulePath, `${name}.component.module.ts`),
      moduleContent
    );
  }

  /**
   *  @description 创建基本管道 ts 模版
   */
  createPipeTpl(name: string, modulePath: string) {
    const pipeContent = getPipeTemplate(name);
    this.createFile(path.join(modulePath, "pipes", `index.ts`), pipeContent);
  }

  /**
   * @description 创建 module 路由模块
   * @param name
   * @param modulePath
   */
  createRouteModuleTpl(name: string, modulePath: string) {
    const routeModuleContent = getRouteModuleTemplate(name as string);
    this.createFile(
      path.join(modulePath, `${name}.route.ts`),
      routeModuleContent
    );
  }

  override build() {
    this.createBaseFolds(this.basePath);
    this.createBaseFiles(this.basePath);
    this.createPipeTpl(this.name, this.basePath);
    this.createModuleTpl(
      this.name,
      this.basePath,
      this.isCreateRouteModule === "是"
    );
    const componentClass = new DispatchComponent("空").get();
    const componentInstance = new componentClass(this.name, {}).build();
    this.creteComponent(componentInstance);
    this.createServiceTpl(this.name, this.basePath);
    if (this.isCreateRouteModule === "是") {
      this.createRouteModuleTpl(this.name, this.basePath);
    }
  }
}
