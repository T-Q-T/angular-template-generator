import * as fs from 'fs';
import * as path from 'path';
import { firstLetterCamelCaseFormatter, processJSON, processJSONArr, removeQuotesFromKeys } from './utils';
import { getBaseComponentTemplate, getBaseHtmlTemplate, getFormTableComponentTemplate, getFormTableTemplate, getModuleTemplate, getPipeTemplate, getRouteModuleTemplate, getServiceTemplate } from './template';

export type ComponentType = '空' | '表单表格搜索组件' | '表格' | '表单'
export interface ComponentOption {
    isAutoDeclaration: string
    createComponentType: ComponentType
    isShowPageHeader: boolean
    stSetting: any[]
    sfSetting: any[]
}
type SchemaAny = any

type ColumnAny = any
/**
 * @description 基本操作类
 */
export class FileFactory {
    constructor(basePath: string, name: string) {
        this.basePath = basePath
        this.name = name
    }

    public basePath!: string
    public name!: string

    /**
      * @description 创建单个文件
      */
    createFile(filePath: string, content: string) {
        try {
            fs.writeFileSync(filePath, content)
        } catch (err) {
            console.error(err)
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
            console.error(err)
        }
    }

    /**
     * @description 读取文件内容
     * @param path 
     */
    readFile(path: string) {
        let data: string = ''
        try {
            data = fs.readFileSync(path, 'utf8');
        } catch (err) {
            console.error('读取文件时出错：', err);
        }
        return data
    }

}


/**
 * @description 组件工厂
 */
export class CreateComponentFactory extends FileFactory {

    constructor(basePath: string, name: string, opt: Partial<ComponentOption>) {
        super(basePath, name)
        this.isAutoDeclaration = opt?.isAutoDeclaration
        this.createComponentType = opt.createComponentType
        this.isShowPageHeader = opt.isShowPageHeader
        this.sfSetting = opt.sfSetting
        this.stSetting = opt.stSetting
    }

    isAutoDeclaration?: string

    createComponentType?: ComponentType

    isShowPageHeader?: boolean

    stSetting?: any[]
    sfSetting?: any[]


    /**
     * @description 查找父级 module.ts 文件
     * @param folderPath 
     * @returns 
     */
    async findModuleFile(folderPath: string): Promise<string | null> {
        let currentPath = folderPath;

        // 如果传入的是文件路径，则转换为其所在的文件夹路径
        if (!fs.existsSync(currentPath) || !fs.statSync(currentPath).isDirectory()) {
            currentPath = path.dirname(folderPath);
        }
        while (currentPath !== path.dirname(currentPath)) {
            const files = fs.readdirSync(currentPath);
            const moduleFile = files.find(file => file.includes('module.ts') && !file.includes('route.module.ts'));
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
    async updateParentModuleDeclaration() {
        try {
            const basePath = path.join(this.basePath, `${this.name}.component.ts`)
            const parentModulePath = await this.findModuleFile(basePath);
            let content = this.readFile(parentModulePath as unknown as string)
            let newContent = content
            const regex = /(declarations:\s*\[[^\]]*?\])/s;
            const match = content.match(regex);
            const CamelCase = firstLetterCamelCaseFormatter(this.name)
            if (match) {
                const updatedContent = match[1].replace(/\]$/, `, ${CamelCase}Component]`);
                newContent = content.replace(match[1], updatedContent);
                newContent = `import { ${CamelCase}Component } from './components/${this.name}/${this.name}.component';\n${newContent}`
            }
            this.createFile(parentModulePath as unknown as string, newContent);
        } catch (err) {
            console.error(err)
        }
    }

    /**
     * @description 创建基本的 scss 模版
     * @param name 
     * @param modulePath 
     */
    createScssTpl() {
        this.createFile(path.join(this.basePath, this.name, `${this.name}.component.scss`), '::ng-deep{}');
    }

    createComponentFolder() {
        this.createFold(path.join(this.basePath, this.name))
    }

    /**
   * @description 构建 schema
   * @returns 
   */
    buildSfData() {
        if (!this.sfSetting) return
        const result: SchemaAny = { properties: {} }
        this.sfSetting?.forEach((item, index) => {
            const res: any = {
                type: 'string',
                title: item.title,
                ui: {}
            }
            if (index === 0) {
                res.type === 'string'
                res.ui.widget = 'select'
                res.ui.width = 100
            }
            result.properties[item.key] = res
        })
        return removeQuotesFromKeys(JSON.stringify(result))
    }

    /**
     * @description 构建 column
     */
    buildStData() {
        if (!this.stSetting) return
        let result = this.stSetting?.map((item) => {
            return {
                title: item.title,
                index: item.key
            }
        })
        return removeQuotesFromKeys(JSON.stringify(result))
    }

    /**
     * @description 获取组件的 html 模版
     * @returns 
     */
    getHtmlTpl() {
        if (this.createComponentType === '空') return getBaseHtmlTemplate(this.name)
        if (this.createComponentType === '表单表格搜索组件') return getFormTableTemplate(this.isShowPageHeader)
        return ''
    }


    /**
     * @description 获取组件内容模版
     * @returns 
     */
    getComponentTpl() {
        if (this.createComponentType === '空') return getBaseComponentTemplate(this.name as string);
        if (this.createComponentType === '表单表格搜索组件') return getFormTableComponentTemplate(this.name, this.buildSfData(), this.buildStData())
        return ''
    }


    /**
     * @description 创建基本 html 文件
     * @param name 
     * @param modulePath 
     */
    createHtmlTpl() {
        this.createFile(path.join(this.basePath, this.name, `${this.name}.component.html`), this.getHtmlTpl());
    }

    /**
     * @description 创建基本组件 ts 模版
     * @param name 
     * @param modulePath 
     */
    createComponentTpl() {
        const componentContent = this.getComponentTpl()
        this.createFile(path.join(this.basePath, this.name, `${this.name}.component.ts`), componentContent);
        if (this.isAutoDeclaration === '是') {
            this.updateParentModuleDeclaration()

        }
    }


    create() {
        this.createComponentFolder()
        this.createHtmlTpl();
        this.createComponentTpl();
        this.createScssTpl();
    }

}


/**
 * @description 模块工厂
 */
export class CreateModuleFactory extends CreateComponentFactory {
    constructor(basePath: string, name: string, opt: any) {
        super(basePath, name, opt)
        this.isCreateRouteModule = opt.isCreateRouteModule
    }

    isCreateRouteModule!: string
    /**
      * @description 创建基本文件夹
      * @param path 
      */
    createBaseFolds(modulePath: string) {
        const constPath = path.join(modulePath, 'const');
        const typePath = path.join(modulePath, 'type');
        const servicePath = path.join(modulePath, 'service');
        const utilsPath = path.join(modulePath, 'utils');
        const pipesPath = path.join(modulePath, 'pipes');
        const componentsPath = path.join(modulePath, 'components');
        // 文件夹数组
        const baseFoldArr = [modulePath, constPath, typePath, servicePath, utilsPath, pipesPath, componentsPath];
        // 创建模块文件夹
        baseFoldArr.forEach((item) => {
            this.createFold(item)
        })
    }

    /**
     * @description 创建基本文件
     * @param modulePath 
     */
    createBaseFiles(modulePath: string) {
        const constPath = path.join(modulePath, 'const', 'index.ts')
        const typePath = path.join(modulePath, 'type', 'index.ts');
        const utilsPath = path.join(modulePath, 'utils', 'index.ts');
        const baseFilesArr = [constPath, typePath, utilsPath];
        baseFilesArr.forEach((item) => {
            this.createFile(item, '');
        });
    }


    /**
     * @description 创建服务模版
     * @param name 
     * @param modulePath 
     */
    createServiceTpl(name: string, modulePath: string) {
        const serviceContent = getServiceTemplate(name)
        this.createFile(path.join(modulePath, 'service', `${name}.service.ts`), serviceContent)
    }

    /**
      * @description 创建基本模块 ts 模版
      * @param name 
      * @param modulePath 
      */
    createModuleTpl(name: string, modulePath: string, isCreateRouteModule: boolean = false) {
        const moduleContent = getModuleTemplate(name as string, isCreateRouteModule);
        this.createFile(path.join(modulePath, `${name}.component.module.ts`), moduleContent);
    }

    /**
     *  @description 创建基本管道 ts 模版
     */
    createPipeTpl(name: string, modulePath: string) {
        const pipeContent = getPipeTemplate(name)
        this.createFile(path.join(modulePath, 'pipes', `index.ts`), pipeContent);
    }



    /**
     * @description 创建 module 路由模块
     * @param name 
     * @param modulePath 
     */
    createRouteModuleTpl(name: string, modulePath: string) {
        const routeModuleContent = getRouteModuleTemplate(name as string);
        this.createFile(path.join(modulePath, `${name}.route.ts`), routeModuleContent);
    }


    override create() {
        this.createBaseFolds(this.basePath);
        this.createBaseFiles(this.basePath);
        this.createPipeTpl(this.name, this.basePath)
        this.createModuleTpl(this.name, this.basePath, this.isCreateRouteModule === '是');
        this.createHtmlTpl();
        this.createComponentTpl();
        this.createServiceTpl(this.name, this.basePath)
        this.createScssTpl();
        if (this.isCreateRouteModule === '是') {
            this.createRouteModuleTpl(this.name, this.basePath);
        }
    }

}


