const fetch = require("node-fetch");
fetch("http://10.17.22.157:8081/slide/hello").then(function(response){
    console.log(response.text())
})