function domChangeCallback(mutationsList, observer){
    console.log('Mutations:', mutationsList)
    console.log('Observer:', observer)
    mutationsList.forEach(mutation => {
        if (mutation.attributeName === 'class') {
            console.log(mutation.oldValue)
            console.log(mutation.target.classList)
            //console.log(mutation.attributeName)
            //console.log('Ch-ch-ch-changes!')
        }
    })
}

const mutationObserver = new MutationObserver(domChangeCallback)
mutationObserver.observe(
    document.getElementById("test"),
    {
        attributes: true,
        attributeOldValue: true
    }
)

let i = 0
let button = document.querySelector("#change_button")
button.addEventListener('click', function(event){
    //更改p的class
    let p = document.querySelector("#test")
    p.classList.add("test" + i)
    i = i + 1
})