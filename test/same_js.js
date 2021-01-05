//尝试将same_js1.html里面的元素拿到same_js2里面的元素中来
// let div1 = document.querySelector("#div1")
// let div2 = document.querySelector("#div2")
// div2.innerHTML = div1.innerHTML

fetch('same_js1.html')
.then(function(response){
    return response.text()
}).then((text) => {
    const doc = new DOMParser().parseFromString(text, 'text/html')
    let div2 = document.querySelector('#div2')
    let div1 = doc.querySelector('#div1')
    div2.innerHTML = div1.innerHTML
})