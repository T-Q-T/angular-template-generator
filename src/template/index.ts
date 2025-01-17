import { firstLetterCamelCaseFormatter } from "../utils";
// -------------------------------------------------- 文件操作栏模版 --------------------------------------------------

export function getBaseHtml(name: string) {
  return `${name} module create!`;
}
/**
 * @description 获取组件 ts 基本模版
 * @param name  组件名
 * @returns
 */
export function getBaseTs(name: string) {
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

export function getFormTableHtml(isCreatePage: boolean = false) {
  return `${isCreatePage ? `<page-header></page-header>\n` : ""}<nz-card>
  <sf mode="search" [schema]="schema" (formSubmit)="st.reset($event)" (formReset)="st.reset($event)"></sf>
  <st #st [data]="url" [columns]="columns">
  </st>
</nz-card>
`;
}
/**
 * @description 获取表单-表格组件模版
 * @param name
 * @returns
 */
export function getFormTableTs(
  name: string,
  schemaData?: string,
  columnData?: string
) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Component, OnInit, ViewChild } from '@angular/core';
  import { SFSchema } from '@delon/form';
  import { ModalHelper } from '@delon/theme';
  import { NzMessageService } from 'ng-zorro-antd/message';
  import { NzModalService } from 'ng-zorro-antd/modal';
  ${columnData ? `import { STColumn, STComponent } from '@delon/abc/st';` : ""}

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

      ${columnData
      ? `@ViewChild('st', { static: true }) st!: STComponent;\n`
      : ""
    }
      ${columnData ? `url='';\n` : ""}
      ${schemaData ? `schema: SFSchema=${schemaData};\n` : ""}
      ${columnData ? `columns: STColumn[]=${columnData};\n` : ""}
      ngOnInit() {
      }
    
    }
    `;
}

export function getFormHtml() {
  return `<sf #sf mode="edit" [schema]="schema" [ui]="ui" button="none">
  </sf>`;
}
export function getFormTs(name: string, schemaData?: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Component, OnInit } from '@angular/core';
  import { SFSchema ,  SFUISchema} from '@delon/form';
  import { ModalHelper } from '@delon/theme';
  import { NzMessageService } from 'ng-zorro-antd/message';
  import { NzModalService } from 'ng-zorro-antd/modal';

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
      ${schemaData ? `schema: SFSchema=${schemaData};\n` : ""}
      ui: SFUISchema = {
        '*': {
          spanLabelFixed: 100,
          grid: { span: 24 }
        }
      };
      
      ngOnInit() {
      }
    
    }
    `;
}

export function getTableHtml() {
  return `<nz-card>
  <st #st [data]="params" [req]="req" [res]="res" [columns]="columns" [scroll]="{ x: '1300px' }"
    (change)="dataChange($event)">
  </st>
</nz-card>`;
}

export function getTableTs(name: string, column?: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { Component, OnInit } from '@angular/core';
  import { STChange, STColumn, STData, STReq, STRequestOptions, STRes } from '@delon/abc/st';
  import { ModalHelper } from '@delon/theme';
  import { NzMessageService } from 'ng-zorro-antd/message';
  import { NzModalService } from 'ng-zorro-antd/modal';

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

      columns: STColumn[]=${column};

      params:any = {
      }

      req: STReq = {
        params: this.params,
        process: (request: STRequestOptions): STRequestOptions => {
          return request
        }
      }

      res: STRes = {
        process: (data: STData[], rawData?: any) => {
          return data
        }
      }

      dataChange(e: STChange) {}
      
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
export function getModuleTemplate(
  name: string,
  isCreateRouteModule: boolean = false,
  isNeedShareModule: boolean = false
) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);

  const routeImportStatement = isCreateRouteModule
    ? `import { ${CamelCaseName}RouteModule } from './${name}.routing.module';`
    : "";
  const routeModuleStatement = isCreateRouteModule
    ? `${CamelCaseName}RouteModule`
    : "";
  return `import { NgModule } from '@angular/core';
    import { CommonModule } from '@angular/common';
    import { ${CamelCaseName}Component } from './components/${name}/${name}.component';
    ${isNeedShareModule ? "import { SharedModule } from '@shared';" : ""}
    ${routeImportStatement}
  
    @NgModule({
      imports: [CommonModule,${routeModuleStatement}${isNeedShareModule ? ",SharedModule" : ""}],
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
    
    }`;
}

/**
 * @description 创建组件路由模块
 * @param name
 */
export function getRouteModuleTemplate(name: string) {
  const CamelCaseName = firstLetterCamelCaseFormatter(name as string);
  return `import { NgModule } from '@angular/core';
    import { RouterModule, Routes } from '@angular/router';
    import { ${CamelCaseName}Component } from './components/${name}/${name}.component';
    
    
    const routes: Routes = [
        { path: '', component: ${CamelCaseName}Component }
    ];
    
    @NgModule({
        imports: [RouterModule.forChild(routes)],
        exports: [RouterModule]
    })
    export class ${CamelCaseName}RouteModule { }
    `;
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
    `;
}

// ------------------------------------------------- 代码块操作栏模版 -------------------------------------------------

export function getHtmlTemplate(content: string, tplKey: string) {
  if (!tplKey) return content;
  return content + `\n<ng-template #${tplKey}>\n</ng-template>`;
}

export function getConfirmTemplate(tplKey: string) {
  return `this.nzModalService.confirm({
    nzTitle: 'title',
    nzContent:${tplKey ? `this.${tplKey}` : '"modelContent"'},
    nzOnOk: () => {
      console.log('ok')
    },
    nzWidth: '450px',
  });`;
}


export function getStaticTemplate(componentName: string) {
  const firstWordReg=/^[a-z]/
  const newComponentName=componentName.replace(firstWordReg,componentName[0].toUpperCase())
  return `this.modal
  .createStatic(${newComponentName}Component, {}, { size: 'md' })
  .subscribe(res => {
    console.log(res)
  });`;
}
