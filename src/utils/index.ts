
/**
 * @description 中分割线转驼峰
 * @param name 
 */
export function firstLetterCamelCaseFormatter(name: string) {
  const CamelCase = name.replace(/-(\w)/g, function (all, letter) {
    return letter.toUpperCase();
  });
  return capitalizeFirstLetter(CamelCase)
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
 * @description 从 vsc 输入框中获取表单配置数据
 * @param str 
 * @returns 
 */
export function getSetting(str: string) {
  let result
  result = str.match(/[\(（].*?[\)）]/g)?.map(item => {
    const [title, key] = item.slice(1, -1).split(/\，|\,/);
    return { title, key };
  }) || [];
  if (result.length) return result
  // 若用户只填一项时,自动帮他的 key 设置空
  result = str.split(/\，|\,/).map((item,index) => {
    return { title:item, key:`${index}` };
  })
  return result
}


export function removeQuotesFromKeys(jsonStr:string) {
  // 使用正则表达式匹配键值对中的冒号
  const regex = /"([^"]+)":/g;
  // 使用 replace() 方法将冒号替换为空字符串
  return jsonStr.replace(regex, '$1:');
}

export function processJSONArr(jsonString:string) {
  const pairs = jsonString.slice(1, -1).split(',');
  let result = '[';
  for (const pair of pairs) {
    result +=removeQuotesFromKeys(pair)+','
  }
  result = result.slice(0, -1) + ']';
  return result;
}