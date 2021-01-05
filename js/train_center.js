function loadTrainCenter(){
    if(train_center.classList.contains("disabled")){
        return
    }
    setSiblingsDisabled(train_list)
    train_list.classList.remove("disabled")

    //TODO:加载模型列表
}