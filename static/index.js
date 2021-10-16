function hide(id){
    document.getElementById(id).style.display = "none"
}
function show(id){
    document.getElementById(id).style.display = "unset"
}
function like(id){
    let formdata = new FormData()
    formdata.append("id", id)
    fetch(`/like`, {method:"POST", body:formdata}).then((res) => {return res.json()}).then((data) => {
        if(data['res'] == "like"){
            document.getElementsByClassName("post-" + id)[0].getElementsByClassName("like-btn")[0].style.color = "red"
            document.getElementsByClassName("post-" + id)[0].getElementsByClassName("likes")[0].innerText = parseInt(document.getElementsByClassName("post-" + id)[0].getElementsByClassName("likes")[0].innerText) + 1
            return
        }if(data['res'] == "login_please"){
            alertify.error("Please Login!")
            return
        }else{
            document.getElementsByClassName("post-" + id)[0].getElementsByClassName("like-btn")[0].style.color = "white"
            document.getElementsByClassName("post-" + id)[0].getElementsByClassName("likes")[0].innerText = parseInt(document.getElementsByClassName("post-" + id)[0].getElementsByClassName("likes")[0].innerText) - 1
            return
        }
    })
}
function account(status){
    if(status == "True"){
        show("account")
    }else{
        show("auth")
    }
}
function hideAll(l){
    for(let i=0;i<l.length;i++){
        document.getElementById(l[i]).style.display = "none"
    }
}

window.addEventListener("load", () => {
    if(localStorage.getItem("lang") != ""){
        document.getElementById("lang-select").value = localStorage.getItem("lang")
    }
    if(localStorage.getItem("filter") != ""){
        document.getElementById("filter").value = localStorage.getItem("filter")
        filterFunc(localStorage.getItem("filter"))
    }
})

function user(user){
    let formdata = new FormData()
    formdata.append("user", user)
    fetch("/get-user", {method:"POST", body:formdata}).then((res) => {return res.json()}).then((data) => {
        data = data['res']
        show("userProfile")
        hideAll(['postDiv', 'search', 'leaderboard', 'account', 'nav-mobile'])
        document.getElementById('name-userProfile').innerText = data['user']
        document.getElementById('points-userProfile').innerText = data['points']
        document.getElementById('joined-userProfile').innerText = data['joined']
        if(today == data['birthday'].replace("-", "|").split("|")[1]){
            document.getElementById("bd-userProfile").innerHTML = "🎂"
        }else{
            document.getElementById("bd-userProfile").innerHTML = ""
        }
    })
}
function $(q){
    return document.querySelector(q)
}
function search(text){
    let formdata = new FormData()
    formdata.append("text", text)
    if(text == ""){
        $("#search-res").innerHTML = ""
    }
    if(text.replace(/\s/g, "").length != 0){
        fetch("search", {method:"POST", body:formdata}).then((res) => {return res.json()}).then((data) => {
            data = data['res']
            $("#search-res").innerHTML = ""
            if(data == "notFound"){
                document.getElementById("search-res").innerHTML = "<h4>Not Found!</h4>"
            }else{
                document.getElementById("search-res").innerHTML = "<br>"
                for(let i=0;i<Object.keys(data).length;i++){
                    let br = document.createElement("br")
                    let div = document.createElement("div")
                    div.id = "user"
                    div.onclick = () => {
                        user(Object.keys(data)[i])
                    }
                    let name = document.createElement("span")
                    name.innerText = Object.keys(data)[i]
                    name.id = "name"
                    let score = document.createElement("span")
                    score.innerText = data[Object.keys(data)[i]]['points'] + "🔥"
                    score.id = "score"
                    div.appendChild(name)
                    div.appendChild(score)
                    $("#search-res").appendChild(div)
                    $("#search-res").appendChild(br)
                }
            }
        })
    }
}
function filterFunc(val){
    if(val == "latest"){
        show("latest")
        hide("most-popular")
        hide("random-posts")
    }
    if(val == "random-posts"){
        show("random-posts")
        hide("most-popular")
        hide("latest")
    }
    if(val == "most-popular"){
        show("most-popular")
        hide("latest")
        hide("random-posts")
    }
    localStorage.setItem("filter", val)
}