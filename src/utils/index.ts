/**
 * @description 获取组件 ts 基本模版
 * @param name  组件名 
 * @returns 
 */
export function getComponentTemplate(name: string) {

  const humpName = firstLetterHumpFormatter(name as string);
  return `import { Component, OnInit } from '@angular/core';

    @Component({
      selector: '${name}',
      templateUrl: './${name}.component.html',
      styleUrls: ['./${name}.component.scss']
    })
    export class ${humpName}Component implements OnInit {
    
      constructor() { }
    
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

  const humpName = firstLetterHumpFormatter(name as string);

  const routeImportStatement = isCreateRouteModule ? `import { ${humpName}RouteModule } from './${name}.route';` : ''
  const routeModuleStatement = isCreateRouteModule ? `${humpName}RouteModule,` : ''
  return `import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ${humpName}Component } from './${name}.component';
  import { SharedModule } from '@shared';
  ${routeImportStatement}

  @NgModule({
    imports: [CommonModule,${routeModuleStatement}SharedModule],
    declarations: [${humpName}Component]
  })
  export class ${humpName}Module { }
  `;
}

export function getPipeTemplate(name: string) {
  const humpName = firstLetterHumpFormatter(name as string);
  return `import { Pipe, PipeTransform } from '@angular/core';

  @Pipe({
    name: '${humpName}'
  })
  export class ${humpName}Pipe implements PipeTransform {
  
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
  const humpName = firstLetterHumpFormatter(name as string);
  return `import { NgModule } from '@angular/core';
  import { RouterModule, Routes } from '@angular/router';
  import { ${humpName}Component } from './${name}.component';
  
  
  const routes: Routes = [
      { path: '', component: ${humpName}Component }
  ];
  
  @NgModule({
      imports: [RouterModule.forChild(routes)],
      exports: [RouterModule]
  })
  export class ${humpName}RouteModule { }
  `
}

export function getServiceTemplate(name: string) {
  const humpName = firstLetterHumpFormatter(name as string);
  return `import { Injectable } from '@angular/core';

  @Injectable({
    providedIn: 'root'
  })
  export class ${humpName}Service {
  
  constructor() { }
  
  }
  `
}


/**
 * @description 中分割线转驼峰
 * @param name 
 */
export function firstLetterHumpFormatter(name: string) {
  const hump = name.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
  return capitalizeFirstLetter(hump)
}

/**
 * @description 驼峰转中划线
 * @param name 
 */
export function strikethroughFormatter(name: string) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/**
 * @description 将字符串首字母变大写
 * @param str 
 * @returns 
 */
function capitalizeFirstLetter(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


