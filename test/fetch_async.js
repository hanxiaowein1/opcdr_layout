//测试一下fetch同步请求

const fetch = require("node-fetch")

async function getData()
{
    const response = await fetch("http://huaiguangcsh.f3322.net:2004/slide/hello")
    const result = await response.json()
    return result
}

async function start()
{
    const result = await getData()
    return result
    //console.log(result)
}

// const result = start()
// console.log(result)

// const result = getData()
// console.log(result)

// let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
// let request = new XMLHttpRequest()
// request.open("get", "http://huaiguangcsh.f3322.net:2004/slide/hello", false)
// request.send(null)
// let data = JSON.parse(request.responseText)
// console.log(data)

let XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest
let request = new XMLHttpRequest()
request.open("post", "http://huaiguangcsh.f3322.net:2004/script/result", false)
let data = {
    "id": "b8e516226bfe4503b0e81e0d0105f995"
}
request.setRequestHeader('Content-Type','application/json')
request.send(JSON.stringify(data))
let data2 = JSON.parse(request.responseText)
console.log(data2)
















