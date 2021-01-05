function loadModelCenter(){
    if(model_center.classList.contains("disabled")){
        return
    }
    setSiblingsDisabled(model_list)
    model_list.classList.remove("disabled")

    //TODO:加载模型列表
}