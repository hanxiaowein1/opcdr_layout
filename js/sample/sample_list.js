function sendsampleName(e){

    let sample_name = e.target.innerHTML;
    //let this = this;
    let data = {'samplename':sample_name}
    // fetch("http://localhost:8080/getSlide",{
    //     method:'POST',
    //     mode:'cors',
    //     headers:new Headers({
    //         'Content-Type': 'application/json'
    //     }),
    //     body: JSON.stringify(data)
    // }).then(function(response){
    //     console.log(response.ok)
    // })

    //点击之后，显示到sample_viewer页面
    sample_list.classList.toggle("disabled")

    let sample_viewer = document.querySelector("#sample_viewer")
    sample_viewer.classList.toggle("disabled")

    let sample_viewer_samplename = document.querySelector("#sample_viewer_samplename")
    sample_viewer_samplename.innerHTML = "当前浏览的切片是：" + sample_name

};

function createSampleList(){
    let pag = 'pagination-demo1'
    let callback = sendsampleName
    var content = function(){
        var result = [];
        for(var i = 1; i < 196; i++){
            result.push(i + "_samplename");
        }
        return result;
    }();
    let li_class = 'sample_elem'

    createPagination(pag, content, callback)
}

const sample_adder_button = document.querySelector("#sample_adder_button")
sample_adder_button.addEventListener('click', function(event){
    sample_list.classList.add('disabled')
    sample_adder.classList.remove('disabled')
})


//createSampleList()
