import * as fs from 'fs';
import * as path from 'path';
import { firstLetterHumpFormatter, getComponentTemplate, getModuleTemplate, getPipeTemplate, getRouteModuleTemplate, getServiceTemplate } from './utils';

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

    constructor(basePath: string, name: string, opt: any) {
        super(basePath, name)
        this.isAutoDeclaration = opt.isAutoDeclaration
    }

    isAutoDeclaration!: string


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
            const hump = firstLetterHumpFormatter(this.name)
            if (match) {
                const updatedContent = match[1].replace(/\]$/, `, ${hump}Component]`);
                newContent = content.replace(match[1], updatedContent);
                newContent = `import { ${hump}Component } from './components/${this.name}.component';\n${newContent}`
            }
            this.createFile(parentModulePath as unknown as string, newContent);
        } catch (err) {
            console.error(err)
        }
    }



    /**
     * @description 创建基本 html 文件
     * @param name 
     * @param modulePath 
     */
    createHtmlTpl(name: string, modulePath: string) {
        this.createFile(path.join(modulePath, `${name}.component.html`), `${name} module create!`);
    }

    /**
     * @description 创建基本组件 ts 模版
     * @param name 
     * @param modulePath 
     */
    createComponentTpl(name: string, modulePath: string) {
        const componentContent = getComponentTemplate(name as string);
        this.createFile(path.join(modulePath, `${name}.component.ts`), componentContent);
        if (this.isAutoDeclaration === '是') {
            this.updateParentModuleDeclaration()

        }
    }

    /**
     * @description 创建基本的 scss 模版
     * @param name 
     * @param modulePath 
     */
    createScssTpl(name: string, modulePath: string) {
        this.createFile(path.join(modulePath, `${name}.component.scss`), '::ng-deep{}');
    }

    create() {
        this.createHtmlTpl(this.name, this.basePath);
        this.createComponentTpl(this.name, this.basePath);
        this.createScssTpl(this.name, this.basePath);
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
        this.createHtmlTpl(this.name, this.basePath);
        this.createComponentTpl(this.name, this.basePath);
        this.createServiceTpl(this.name, this.basePath)
        this.createScssTpl(this.name, this.basePath);
        if (this.isCreateRouteModule === '是') {
            this.createRouteModuleTpl(this.name, this.basePath);
        }
    }

}


