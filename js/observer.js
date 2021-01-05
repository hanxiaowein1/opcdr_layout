/**
 * 监控导航栏的a元素的class:
 * //一个导航栏对应一个div，因此，在导航栏变状态的时候（disabled->abled），可以触发mutation事件来刷新相关的div
 * 1.abled->disabled
 * 2.disabled->abled
 * @type {MutationObserver}
 */
const sampleCenterObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(mutation => {
        switch(mutation.type){
            case "attributes":
                switch (mutation.attributeName){
                    case 'class':
                        if(mutation.target.classList.contains('active')){
                            loadSampleCenter()
                        }
                }
        }
    })
})

sampleCenterObserver.observe(
    document.querySelector("#sample_center_nav"),
    {
        attributes: true,
        attributeOldValue: true
    }
)

// const slideCenterObserver = new MutationObserver(function(mutationList, observer){
//     mutationList.forEach(mutation => {
//         switch(mutation.type){
//             case "attributes":
//                 switch (mutation.attributeName){
//                     case 'class':
//                         if(mutation.target.classList.contains('active')){
//                             loadSlideCenter()
//                         }
//                 }
//         }
//     })
// })
//
// slideCenterObserver.observe(
//     document.querySelector("#slide_center_nav"),
//     {
//         attributes: true,
//         attributeOldValue: true
//     }
// )

const modelCenterObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(mutation => {
        switch(mutation.type){
            case "attributes":
                switch (mutation.attributeName){
                    case 'class':
                        if(mutation.target.classList.contains('active')){
                            loadModelCenter()
                        }
                }
        }
    })
})

modelCenterObserver.observe(
    document.querySelector("#model_center_nav"),
    {
        attributes: true,
        attributeOldValue: true
    }
)

const trainCenterObserver = new MutationObserver(function(mutationList, observer){
    mutationList.forEach(mutation => {
        switch(mutation.type){
            case "attributes":
                switch (mutation.attributeName){
                    case 'class':
                        if(mutation.target.classList.contains('active')){
                            loadTrainCenter()
                        }
                }
        }
    })
})

trainCenterObserver.observe(
    document.querySelector("#train_center_nav"),
    {
        attributes: true,
        attributeOldValue: true
    }
)



