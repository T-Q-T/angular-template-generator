import { FileFactory } from "./file-factory";
import * as fs from "fs";
import { getHtmlTemplate } from "./template";
import { addTemplateRefAndViewChild } from "./utils";
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

    /***
     * @description 读取文件内容,返回更新后的内容
     */
    getFileContent() {
        let content = this.readFile(this.basePath)
        if (this.isCustom && this.tplKey) {
            content = this.getTemplateRefDeclaration(content)
            content = this.getComponentTemplate(content)
        }
        return content
    }

    /**
     * @description 更新自定义模版的 html 内容
     */
    getCustomTemplateHtml() {
        let content = this.readFile(this.basePath)
        return getHtmlTemplate(content, this.tplKey as string)
    }

    /**
     * @description 更新 angular 顶部 template 声明
     * @param content 
     */
    getTemplateRefDeclaration(content: string): string {
        const hasDeclaration = (content as string).includes('TemplateRef') && (content as string).includes('ViewChild')
        if (hasDeclaration) return content
        content = addTemplateRefAndViewChild(content as string)
        return content
    }

    /**
     * @description 更新组件内部的 template 声明
     * @param content 
     */
    getComponentTemplate(content: string): string {
        return content
    }




    build() {
        const tsContent = this.getFileContent(), htmlContent = this.getCustomTemplateHtml()
        this.createFile(this.basePath, tsContent)
        this.createFile(this.basePath.replace('.ts', '.html'), htmlContent)
    }

}