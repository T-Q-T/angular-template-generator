/**
 * @description 中分割线转驼峰
 * @param name
 */
export function firstLetterCamelCaseFormatter(name: string) {
  const CamelCase = name.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
  return capitalizeFirstLetter(CamelCase);
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

/**
 * @description 从 vsc 输入框中获取表单配置数据 弃用
 * @param str
 * @returns
 */
export function getSetting(str: string) {
  let result;
  result =
    str.match(/[\(（].*?[\)）]/g)?.map((item) => {
      const [title, key] = item.slice(1, -1).split(/\，|\,/);
      return { title, key };
    }) || [];
  if (result.length) return result;
  // 若用户只填一项时,自动帮他的 key 设置空
  result = str.split(/\，|\,/).map((item, index) => {
    return { title: item, key: `${index}` };
  });
  return result;
}

/**
 * @description 从 vsc 输入框中获取表单配置数据
 * @param str
 * @returns
 */
export function newGetSetting(str: string) {
  const commaReg = /\,|\，/,
    colonReg = /\;|\；/,
    orReg = /\||\｜/;
  // ; 表示每一截数据
  const dataItem = str.split(colonReg);
  return dataItem.map((item) => {
    let [title, key, widget, ...schemaEnum] = item?.trim().split(commaReg);
    if (schemaEnum&&schemaEnum.length) {
      schemaEnum = schemaEnum.join(",").split(orReg);
      (schemaEnum as any) = schemaEnum.map((item, index) => {
        const [label, value] = item?.trim().split(commaReg);
        return {
          label,
          value: value || index,
        };
      });
    }
    return {
      title: title?.trim(),
      key: key?.trim(),
      widget: widget?.trim(),
      schemaEnum,
    };
  });
}

export function removeQuotesFromKeys(jsonStr: string) {
  // 使用正则表达式匹配键值对中的冒号
  const regex = /"([^"]+)":/g;
  // 使用 replace() 方法将冒号替换为空字符串
  return jsonStr.replace(regex, "$1:");
}

/**
 * @description 将对象的 undefined 属性的 key 浅删除
 */
export function shallowFilterObjUndefinedProperty(obj: any) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      delete obj[key];
    }
  }
  return obj;
}




/**
 * @description  给代码增加 viewChild 和 templateRef 声明
 * @param importStatement 
 * @returns 
 */
export function addTemplateRefAndViewChild(importStatement:string) {
    const regex = /import\s+\{([^}]+)\}\s+from\s+'@angular\/core';/;
    return importStatement.replace(regex, (match, group) => {
        const imports = group.split(',').map((item:string) => item.trim()).filter((item:string)=>item);
            imports.push('TemplateRef');
            imports.push('ViewChild');
        return `import { ${imports.join(', ')} } from '@angular/core';`;
    });
}

/**
 * @description 给代码 constructor 增加内容
 * @param input 文件内容
 * @param content 待增加的内容
 * @returns 
 */
export function addServiceToConstructor(input:string,content:string) {
  const regex = /constructor\s*\(([^)]*)\)\s*\{/;
  return input.replace(regex, (match, params) => {
      const paramList = params.split('\n').map((param:string) => param.trim().replace(',',''));
      paramList.push(content);
      const newParams = paramList.filter((item:string)=>item).join(',\n  ');

      return `constructor(\n  ${newParams},\n) {`;
  });
}

export function addTemplateDeclaration(input:string,content:string) {
  const regex = /constructor\s*\([\s\S]*?\)\s*\{\s*\}/;
  return input.replace(regex, (match) => `${match}\n${content}`);
}
