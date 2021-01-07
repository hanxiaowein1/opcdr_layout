async function getSlideCenter(url){
    try {
        const res = await ( await fetch(url) ).text();
        return res
    } catch(e) { console.log(e); }
}

class SlideViewer extends HTMLElement{
    constructor() {
        super();
        this.annos = []
        this.init_flag = false
        getSlideCenter('slide_center.html').then(function(data){
            const doc = new DOMParser().parseFromString(data, 'text/html')
            let templateElem = doc.querySelector("#slideViewerTemplate")
            //let templateElem = document.querySelector("#slideViewerTemplate")
            let content = templateElem.content.cloneNode(true)
            content.querySelector('img').setAttribute('src', this.getAttribute('image'))
            this.appendChild(content)

            //this.original = this.innerHTML
            //console.log('test')
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

    initImg(){
        let recommend = this.querySelector('div.recommend')
        if(!this.init_flag){
            for(let i = 0;i < 10;i++){
                let container = document.createElement('div')
                let status = document.createElement('img')
                status.classList.add("status")
                status.src = 'images/cross.png'
                status.width = 20
                status.height=20
                let ceil = document.createElement('img')
                ceil.src= 'images/1.jpg'
                ceil.width = 100
                ceil.height = 100
                ceil.classList.add('ceil')
                container.append(status, ceil)
                recommend.append(container)
            }
            this.init_flag = true
        }
        else{
            let status_imgs = this.querySelectorAll('img.status')
            let ceils = this.querySelectorAll('img.ceil')
            for(let i=0;i<ceils.length;i++){
                ceils[i].src='images/1.jpg'
                status_imgs[i].src='images/cross.png'
            }
        }

    }

    createCanvas(){
        if(this.annos.length != 0){
            for(let i = 0;i<this.annos.length;i++){
                let anno = this.annos[i]
                anno.removeAnnotation('#0')

                let local_str = '{ \n' +
                    '    "@context": "http://www.w3.org/ns/anno.jsonld",\n' +
                    '    "id": "#0",\n' +
                    '    "type": "Annotation",\n' +
                    '    "body": [{\n' +
                    '      "type": "TextualBody",\n' +
                    '      "value": "It\'s Hallstatt in Upper Austria"\n' +
                    '    }, {\n' +
                    '      "type": "TextualBody",\n' +
                    '      "purpose": "tagging",\n' +
                    '      "value": "Hallstatt"\n' +
                    '    }, {\n' +
                    '      "type": "TextualBody",\n' +
                    '      "purpose": "tagging",\n' +
                    '      "value": "Upper Austria"\n' +
                    '    }],\n' +
                    '    "target": {\n' +
                    '      "selector": [{\n' +
                    '        "type": "FragmentSelector",\n' +
                    '        "conformsTo": "http://www.w3.org/TR/media-frags/",\n' +
                    '        "value": "xywh=pixel:1,1,500,500"\n' +
                    '      }]\n' +
                    '    }\n' +
                    '  }'

                let local_json = JSON.parse(local_str)
                anno.addAnnotation(local_json)
            }
        }
        else{
            let status_imgs = this.querySelectorAll('img.status')
            let ceils = this.querySelectorAll('img.ceil')
            for(let i=0;i<ceils.length;i++){
                ceils[i].src='images/1.jpg'
                status_imgs[i].src='images/cross.png'
                let anno = createCanvas(ceils[i], status_imgs[i])
                this.annos.push(anno)
            }
        }
    }
}

