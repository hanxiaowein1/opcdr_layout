function loadSampleCenter(){
    if(sample_center.classList.contains("disabled"))
        return
    //将下一层级的div全部置为disabled
    let sample_components = sample_center.querySelectorAll(":scope > div")
    Array.from(sample_components).forEach(function(sample_component){
        sample_component.classList.add("disabled")
    })
    //将sample_list去掉disabled属性
    sample_list.classList.remove("disabled")
    //let sample_list_components = sample_list.querySelectorAll("div")

    //然后刷新sample_list
    createSampleList()
}