const button = document.querySelector("#sample_viewer_return_button")
button.addEventListener('click', event=>{
    let sample_viewer = document.querySelector("#sample_viewer")
    sample_viewer.classList.toggle("disabled")

    let sample_list = document.querySelector("#sample_list")
    sample_list.classList.toggle("disabled")
})