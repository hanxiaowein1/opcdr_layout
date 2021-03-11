function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    )
}

function test(){
    let date = new Date()
    let second = date.getSeconds()
    if(second % 2 == 0){
        return Promise.resolve()
    }else{
        return Promise.resolve()
    }
    //console.log(second)
}

// test().then(function(){
//     console.log('333')
// })
//
// let list1 = [1,2,3]
// for(let value of list1){
//     value = value + 1
// }
// for(let value of list1){
//     console.log(value)
// }

let letters = [5, 6, 7];
let numbers = [1, 2, 3];

letters = letters.concat(numbers)

// letters.push(numbers)
console.log(letters)

// letters.concat(numbers);
// console.log(letters)

function getDiffRet(para){
    if(para%2 == 1){
        return 1
    }else{
        return 'c'
    }
}

let getvalue = getDiffRet(2)
console.log(getvalue)
console.log(typeof (getvalue) == "string")

let promise = new Promise(function(){})
console.log(typeof(promise))

function typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
}

console.log(typeOf(promise) == 'promise')
console.log(typeOf(getvalue) == "string")
let myArray = []
console.log(typeOf(myArray))