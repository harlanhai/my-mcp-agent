// 简单的查询分类器函数
function isWeatherQuery(input: string): boolean {
  const weatherKeywords = ['天气', '气温', '下雨', '阴天', '晴天', '预报', '湿度', '风速'];
  return weatherKeywords.some((keyword) => input.toLowerCase().includes(keyword));
}

function isCodeQuery(input: string): boolean {
  const codeKeywords = ['代码', '检查', 'bug', '错误', '函数', '编程', '语法', '调试', 'javascript', 'python'];
  return codeKeywords.some((keyword) => input.toLowerCase().includes(keyword));
}

export { isWeatherQuery, isCodeQuery };