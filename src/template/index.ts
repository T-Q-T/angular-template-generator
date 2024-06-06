import { firstLetterCamelCaseFormatter } from "../utils";

export function getBaseHtmlTemplate(name: string) {
  return `${name} module create!`
}

export function getFormTableTemplate(isCreatePage: boolean = false) {
  return `${isCreatePage ? `<page-header></page-header>\n` : ''}<nz-card>
  <sf mode="search" [schema]="schema" (formSubmit)="st.reset($event)" (formReset)="st.reset($event)"></sf>
  <st #st [data]="url" [columns]="columns">
  </st>
</nz-card>
`
}

/**
 * @description 获取组件 ts 基本模版
 * @param name  组件名 
 * @returns 
 */
export function getBaseComponentTemplate(name: string) {

  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Component, OnInit } from '@angular/core';
  
      @Component({
        selector: '${name}',
        templateUrl: './${name}.component.html',
        styleUrls: ['./${name}.component.scss']
      })
      export class ${CamelCaseName}Component implements OnInit {
      
        constructor() { }
      
        ngOnInit() {
        }
      
      }
      `;
}

/**
 * @description 获取表单-表格组件模版
 * @param name 
 * @returns 
 */
export function getFormTableComponentTemplate(name: string, schemaData?: string, columnData?: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Component, OnInit, ViewChild } from '@angular/core';
  import { SFSchema } from '@delon/form';
  import { ModalHelper } from '@delon/theme';
  import { NzMessageService, NzModalService } from 'ng-zorro-antd';
  ${columnData ? `import { STColumn, STComponent } from '@delon/abc';` : ''}

    @Component({
      selector: '${name}',
      templateUrl: './${name}.component.html',
      styleUrls: ['./${name}.component.scss']
    })
    export class ${CamelCaseName}Component implements OnInit {
    
      constructor(
        private modal: ModalHelper,
        private msg: NzMessageService,
        private modalService: NzModalService
      ) { }

      ${columnData?`@ViewChild('st', { static: true }) st: STComponent;`:''}

      ${columnData?`url='';`:''}

      ${schemaData?`schema: SFSchema=${schemaData};\n`:''}

      ${columnData?`columns: STColumn[]=${columnData};\n`:''}

      
      ngOnInit() {
      }
    
    }
    `;
}



/**
 * @description 获取模块基本模版
 * @param name  模块名
 * @returns 
 */
export function getModuleTemplate(name: string, isCreateRouteModule: boolean = false) {

  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);

  const routeImportStatement = isCreateRouteModule ? `import { ${CamelCaseName}RouteModule } from './${name}.route';` : ''
  const routeModuleStatement = isCreateRouteModule ? `${CamelCaseName}RouteModule,` : ''
  return `import { NgModule } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { ${CamelCaseName}Component } from './${name}.component';
    import { SharedModule } from '@shared';
    ${routeImportStatement}
  
    @NgModule({
      imports: [CommonModule,${routeModuleStatement}SharedModule],
      declarations: [${CamelCaseName}Component]
    })
    export class ${CamelCaseName}Module { }
    `;
}

export function getPipeTemplate(name: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Pipe, PipeTransform } from '@angular/core';
  
    @Pipe({
      name: '${CamelCaseName}'
    })
    export class ${CamelCaseName}Pipe implements PipeTransform {
    
      transform(value: string): string {
        return value
      }
    
    }`
}


/**
 * @description 创建组件路由模块
 * @param name 
 */
export function getRouteModuleTemplate(name: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { ${CamelCaseName}Component } from './${name}.component';
    
    
    const routes: Routes = [
        { path: '', component: ${CamelCaseName}Component }
    ];
    
    @NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
    export class ${CamelCaseName}RouteModule { }
    `
}

export function getServiceTemplate(name: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Injectable } from '@angular/core';
  
    @Injectable({
      providedIn: 'root'
    })
    export class ${CamelCaseName}Service {
    
    constructor() { }
    
    }
    `
}