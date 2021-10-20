function hide(id){
    document.getElementById(id).style.display = "none"
    unblur(["nav", "home"])
}
function show(id){
    document.getElementById(id).style.display = "unset"
    document.getElementById(id).className = "divElement"
    blur(["nav", "home"])
}
function blur(ids){
    for(let i=0;i<ids.length;i++){
        document.getElementById(ids[i]).style.filter = "blur(7px)"
        document.getElementById(ids[i]).style.opacity = 0.7
    }
}
function unblur(ids){
    for(let i=0;i<ids.length;i++){
        document.getElementById(ids[i]).style.filter = "none"
        document.getElementById(ids[i]).style.opacity = 1
    }
}
function like(id){
    let formdata = new FormData()
    formdata.append("id", id)
    var sign = $("#filter").value.charAt(0)
    fetch(`/like`, {method:"POST", body:formdata}).then((res) => {return res.json()}).then((data) => {
        if(data['res'] == "like"){
            document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("like-btn")[0].style.color = "red"
            document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("likes")[0].innerText = parseInt(document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("likes")[0].innerText) + 1
            return
        }if(data['res'] == "login_please"){
            alertify.error("Please Login!")
            return
        }else{
            document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("like-btn")[0].style.color = "white"
            document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("likes")[0].innerText = parseInt(document.getElementsByClassName("post-" + id + `-${sign}`)[0].getElementsByClassName("likes")[0].innerText) - 1
            return
        }
    })
}
function account(status){
    if(status == "True"){
        show("account")
    }else{
        document.getElementById("auth").style.display = "unset"
    }
}
function hideAll(l){
    for(let i=0;i<l.length;i++){
        document.getElementById(l[i]).style.display = "none"
    }
}

window.addEventListener("load", () => {
    if(localStorage.getItem("lang") != "null"){
        document.getElementById("lang-select").value = localStorage.getItem("lang")
    }
    if(localStorage.getItem("filter") != "null"){
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
        document.getElementById("share-btn").onclick = () => {
            share_user(data['user'])
        }
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
        document.getElementById("latest").style.display = "unset"
        document.getElementById("most-popular").style.display = "none"
        document.getElementById("random-posts").style.display = "none"
    }
    if(val == "random-posts"){
        document.getElementById("random-posts").style.display = "unset"
        document.getElementById("most-popular").style.display = "none"
        document.getElementById("latest").style.display = "none"
    }
    if(val == "most-popular"){
        document.getElementById("most-popular").style.display = "unset"
        document.getElementById("latest").style.display = "none"
        document.getElementById("random-posts").style.display = "none"
    }
    localStorage.setItem("filter", val)
}
function copyText(text) {
    const elem = document.createElement('textarea');
    elem.value = text;
    document.body.appendChild(elem);
    elem.select();
    document.execCommand('copy');
    document.body.removeChild(elem);
 }

function share(id){
    copyText(window.location.href + "post/" + id)
    alertify.success("Copied link!")
}
function share_user(name){
    copyText(window.location.href + "user/" + name)
    alertify.success("Copied link!")
}