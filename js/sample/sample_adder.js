//有两个按钮，返回则不刷新sample_list，保存则刷新sample_list

const sample_adder_save_button = document.querySelector("#sample_adder_save_button")
sample_adder_save_button.addEventListener('click',function(event){
    //将div设为disabled
    sample_adder.classList.add("disabled")
    sample_list.classList.remove("disabled")
    createSampleList()
})

const sample_adder_return_button = document.querySelector("#sample_adder_return_button")
sample_adder_return_button.addEventListener('click', function(Event){
    sample_adder.classList.add('disabled')
    sample_list.classList.remove('disabled')
})