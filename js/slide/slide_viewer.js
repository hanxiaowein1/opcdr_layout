//设置服务器
//const serverurl = "http://huaiguangcsh.f3322.net:2004"

const zhangxueying_url = "http://localhost:8081"

async function getSlideCenter(url){
    try {
        const res = await ( await fetch(url) ).text();
        return res
    } catch(e) { console.log(e); }
}

class SlideViewer extends HTMLElement{
    constructor() {
        super();
        this.canvas_annos = []
        this.init_flag = false
        getSlideCenter('slide_center.html').then(function(data){
            const doc = new DOMParser().parseFromString(data, 'text/html')
            let templateElem = doc.querySelector("#slideViewerTemplate")
            //let templateElem = document.querySelector("#slideViewerTemplate")
            let content = templateElem.content.cloneNode(true)
            // let viewer = new Viewer(content.querySelector(":scope ul.thumbnail_ul"),{
            //     url: 'data-original'
            // })
            //content.querySelector('img').setAttribute('src', this.getAttribute('image'))
            this.appendChild(content)
        }.bind(this))
    }

    /**
     * 将其恢复到一开始的状态
     */
    clean(){
        this.init_flag = false
        let recommend = this.querySelector('div.recommend')
        recommend.innerHTML = ''
        this.querySelector("img.thumbnail").setAttribute('src', '')
    }

    initImg(mid, sid){
        let recommend = this.querySelector('div.recommend')
        this.querySelector('img.thumbnail').setAttribute('src', zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/thumbnail.jpg')
        if(!this.init_flag){
            let thumbnail = this.querySelector('img.thumbnail')
            thumbnail.onload = function(){
                let temp_elem = this.querySelector('img.thumbnail')
                //输出图像的原始宽高
                //console.log("natural:", temp_elem.naturalWidth, temp_elem.naturalHeight)
                let viewer = new Viewer(temp_elem)
            }.bind(this)

            for(let i = 0;i < 10;i++){
                let container = document.createElement('div')
                if(i == 5){
                    container.style = "clear:left;"
                }
                let status_container = document.createElement('div')
                status_container.classList.add('status')
                let status = document.createElement('img')
                status.classList.add("status")
                status_container.append(status)
                status.src = 'images/cross.png'
                let ceil = document.createElement('img')
                //ceil.src = "images/ceil/" + i + ".jpg"
                ceil.src = zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/' + i.toString() + '.jpg'
                ceil.classList.add('ceil')
                ceil.setAttribute('mid', mid)
                ceil.setAttribute('sid', sid)
                ceil.setAttribute('number', i)
                container.append(ceil, status_container)
                recommend.append(container)
            }
            this.init_flag = true
        }
        else{
            let status_imgs = this.querySelectorAll('img.status')
            let ceils = this.querySelectorAll('img.ceil')
            for(let i=0;i<ceils.length;i++){
                let ceil = ceils[i]
                //ceil.src = "images/ceil/" + i + ".jpg"
                ceil.src = zhangxueying_url + '/modelRecommend/getRecomimg/' + mid + '/' + sid + '/' + i.toString() + '.jpg'
                status_imgs[i].src='images/cross.png'
            }
        }

    }

    /**
     * 根据mid和sid查询切片的计算结果(框)
     * @param mid
     * @param sid
     */
    createCanvas(mid, sid){
        let post_data = {'mid':mid, 'sid':sid}
        fetch(zhangxueying_url + '/annoRecommend/getRecommednAnno', {
            method : 'POST',
            headers : new Headers({
                'Content-Type' : 'application/json'
            }),
            body : JSON.stringify(post_data)
        }).then(function(response){
            return response.json()
        }).then(function(json_data){
            let anno_list = json_data['data']['Result']
            this.anno_list = anno_list
            if(this.canvas_annos.length != 0){
                for(let i = 0;i<this.annos.length;i++){
                    let canvas_anno = this.canvas_annos[i]
                    canvas_anno.removeAnnotation('#0')

                    // let local_str = '{ \n' +
                    //     '    "@context": "http://www.w3.org/ns/anno.jsonld",\n' +
                    //     '    "id": "#0",\n' +
                    //     '    "type": "Annotation",\n' +
                    //     '    "body": [{\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "value": "It\'s Hallstatt in Upper Austria"\n' +
                    //     '    }, {\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "purpose": "tagging",\n' +
                    //     '      "value": "Hallstatt"\n' +
                    //     '    }, {\n' +
                    //     '      "type": "TextualBody",\n' +
                    //     '      "purpose": "tagging",\n' +
                    //     '      "value": "Upper Austria"\n' +
                    //     '    }],\n' +
                    //     '    "target": {\n' +
                    //     '      "selector": [{\n' +
                    //     '        "type": "FragmentSelector",\n' +
                    //     '        "conformsTo": "http://www.w3.org/TR/media-frags/",\n' +
                    //     '        "value": "xywh=pixel:1,1,500,500"\n' +
                    //     '      }]\n' +
                    //     '    }\n' +
                    //     '  }'

                    // let local_json = JSON.parse(local_str)
                    // anno.addAnnotation(local_json)

                    let local_str = webAnno2LocalAnno(anno_list[i])
                    let local_json = JSON.parse(local_str)
                    canvas_anno.addAnnotation(local_json)
                }
            }
            else{
                let status_imgs = this.querySelectorAll('img.status')
                let ceils = this.querySelectorAll('img.ceil')
                for(let i=0;i< ceils.length; i++){
                    status_imgs[i].src='images/cross.png'
                    let ceil = ceils[i]
                    let canvas_anno = createCanvas(ceils[i], status_imgs[i])
                    let update_function = function(annotation, ceil, status){
                        let web_json = localAnno2WebAnno(annotation)
                        //为web_json里面赋值
                        let number = ceil.getAttribute('number')
                        let anno = this.anno_list[parseInt(number)]
                        web_json['id'] = anno['id']
                        web_json['aid'] = anno['aid']
                        web_json['sid'] = anno['sid']
                        web_json['mid'] = anno['mid']
                        //x y w h
                        let local_cir_rect_str = web_json['cir_rect'].split(',')
                        let local_cir_rect = []
                        Array.from(local_cir_rect_str).forEach(function(elem){
                            local_cir_rect.push(parseInt(elem))
                        })
                        //x y
                        let top_left_str = anno['top_left'].split(',')
                        let top_left = []
                        Array.from(top_left_str).forEach(function(elem){
                            top_left.push(parseInt(elem))
                        })
                        let center_point = {}
                        center_point['x'] = top_left[0] + local_cir_rect[0] + local_cir_rect[2] / 2
                        center_point['y'] = top_left[1] + local_cir_rect[1] + local_cir_rect[3] / 2
                        let web_cir_rect = [local_cir_rect[0] + top_left[0], local_cir_rect[1] + top_left[1], local_cir_rect[2], local_cir_rect[3]]
                        let web_cir_rect_str = ''
                        Array.from(web_cir_rect).forEach(function(elem){
                            web_cir_rect_str+=toString(elem) + ','
                        })
                        web_cir_rect_str = web_cir_rect_str.substring(0, web_cir_rect_str.length - 1)
                        web_json['cir_rect'] = web_cir_rect_str
                        web_json['top_left'] = anno['top_left']
                        web_json['type'] = anno['type']
                        let post_data = {number:web_json}
                        fetch(zhangxueying_url + "/annoRecommend/updateRecommendAnnotations", {
                            method : 'POST',
                            headers : new Headers({
                                'Content-Type' : 'application/json'
                            }),
                            body : JSON.stringify(post_data)
                        }).then(function(response){
                            return response.json()
                        }).then(function(json_data){
                            if(json_data['code'] == 200){
                                if(status!=null){
                                    status.src='images/tick.jpg'
                                }
                            }else{
                                console.log('update mid=', mid, 'sid=', sid, 'number=', number, ' failed')
                            }
                        })
                    }.bind(this)

                    this.canvas_annos.push(canvas_anno)
                }
            }
        })

    }
}

