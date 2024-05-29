/**
 * @description 获取 ts 基本模版
 * @param name  模块名 
 * @returns 
 */
export function getComponentTemplate(name: string) {
  // 驼峰命名
  const humpName = humpFormatter(name as string);
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
export function getModuleTemplate(name: string) {
  // 驼峰命名
  const humpName = humpFormatter(name as string);
  return `import { NgModule } from '@angular/core';
  import { CommonModule } from '@angular/common';
  import { ${humpName}Component } from './${name}.component';
  import { SharedModule } from '@shared';
  
  @NgModule({
    imports: [
      CommonModule,
      SharedModule
    ],
    declarations: [${humpName}Component]
  })
  export class ${humpName}Module { }
  `;
}


/**
 * @description 中分割线转驼峰
 * @param name 
 */
export function humpFormatter(name: string) {
  return name.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
}

/**
 * @description 驼峰转中划线
 * @param name 
 */
export function strikethroughFormatter(name: string) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}