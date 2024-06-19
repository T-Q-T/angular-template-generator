import { FileFactory } from "./file-factory";
import * as fs from "fs";
import { getConfirmTemplate, getHtmlTemplate } from "./template";
import { addNzModalServiceToConstructor, addTemplateDeclaration, addTemplateRefAndViewChild } from "./utils";
//  这里是代码模版功能的创建工厂,用于读取创建代码模版


/**
 * @description 确认弹窗模版
 */
export class ConfirmModal extends FileFactory {
    constructor(path: string, name: string, isCustom?: string, tplKey?: string) {
        super(path, name)
        this.isCustom = isCustom
        this.tplKey = tplKey
    }

    isCustom?: string
    tplKey?: string
    htmlPath: string = this.basePath.replace('.ts', '.html')

    /***
     * @description 读取文件内容,返回更新后的内容
     */
    getFileContent() {
        let content = this.readFile(this.basePath)
        if (this.isCustom && this.tplKey) {
            content = this.getTemplateRefDeclaration(content)
            content = this.getClassRefDeclaration(content)
        }
        content = this.getComponentTemplate(content)
        return content
    }

    /**
     * @description 更新自定义模版的 html 内容
     */
    getCustomTemplateHtml() {
        let content = this.readFile(this.htmlPath)
        return getHtmlTemplate(content, this.tplKey as string)
    }

    /**
     * @description 获取 angular 顶部 template 声明
     * @param content 
     */
    getTemplateRefDeclaration(content: string): string {
        const hasDeclaration = content.includes('TemplateRef') && content.includes('ViewChild')
        if (hasDeclaration) return content
        content = addTemplateRefAndViewChild(content as string)
        return content
    }

    /**
     * @description 获取 class 的 templateRef 声明
     * @param content 
     * @returns 
     */
    getClassRefDeclaration(content: string) {
        return addTemplateDeclaration(content as string, `@ViewChild('${this.tplKey}') ${this.tplKey}!: TemplateRef<any>;\n`)
    }

    /**
     * @description 获取组件内部的 template 声明
     * @param content 
     */
    getComponentTemplate(content: string): string {
        const hasWay = content.includes('NzModalService')
        if (!hasWay) {
            content = addNzModalServiceToConstructor(content, 'private nzModalService: NzModalService')
            content = `import { NzModalService } from 'ng-zorro-antd/modal';\n` + content
        }
        return content
    }

    /**
     * @description 获取弹窗模版
     */
    getModalTemplate() {
        return getConfirmTemplate(this.tplKey as string)
    }


    build() {
        const tsContent = this.getFileContent(), htmlContent = this.getCustomTemplateHtml()
        this.createFile(this.basePath, tsContent)
        this.createFile(this.htmlPath, htmlContent)
        return this
    }

}