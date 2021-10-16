from flask import *
import random,json,hashlib,datetime
app = Flask(__name__)
score = 3
app.config["SECRET_KEY"] = "DROP TABLE USERS"
with open("db/data.json") as fp:
    data = json.load(fp)
with open("db/posts.json") as fp:
    posts = json.load(fp)

def saveJson():
    with open("db/data.json", "w+") as fp:
        json.dump(data, fp, indent=4)
    with open("db/posts.json", "w+") as fp:
        json.dump(posts, fp, indent=4)

def hasher(text) -> str:return hashlib.md5(text.encode()).hexdigest()

def auth(username, pw):
    global data
    try:
        if data[username]['pw'] == hasher(pw):
            return True
        return False
    except KeyError:
        return False

@app.route('/get-user', methods=['POST'])
def get_user():
    user = request.form['user']
    res = {}
    if user in data.keys():
        res = {
            "user":user,
            "birthday": data[user]['birthday'],
            "joined": data[user]['joined'],
            "points": data[user]['points']
        }
        return jsonify({"res":res})

    return "False"

@app.route('/search', methods=['POST'])
def search():
    t = str(request.form['text']).lower()
    r = {}
    for user in data.keys():
        i = str(user).lower()
        if i == t or t.startswith(i) or t.endswith(i) or i.startswith(t) or i.endswith(t) or i in t or t in i:
            r[user] = {"points":data[user]['points'], "birthday":data[user]['birthday']}
    if r == {}:
        r = "notFound"
    return jsonify({"res":r})

@app.route('/')
def index():
    name = request.cookies.get('name')
    pw = request.cookies.get('pw')
    islogged = auth(name, pw)
    l = list(posts.items())
    random.shuffle(l)
    randomPosts = dict(l)
    latest = dict(reversed(list(posts.items())))
    points = ""
    isbd = False
    joined = ""
    if islogged:
        points = data[name]['points']
        isbd = data[name]['birthday'].replace("-", "|", 1).split("|")[1] == str(datetime.datetime.now().strftime("%m-%d"))
        joined = data[name]['joined']
    byMostPopular = {}
    for post in posts.keys():
        byMostPopular[post] = len(posts[post]['likes'])
    byMostPopular = list(dict(sorted(byMostPopular.items(), key=lambda item: item[1])).keys())[::-1]
    leaderBoard = {}
    for user in data.keys():
        leaderBoard[user] = data[user]['points']
    leaderBoardNames = list(dict(sorted(leaderBoard.items(), key=lambda item: item[1])).keys())[::-1]
    return render_template(
        'index.html',
        r=random.randint(0, 9999),
        islogged=islogged,
        randomPosts=randomPosts,
        latest=latest,
        byMostPopular=byMostPopular,
        name=name,
        points=points,
        leaderBoardNames=leaderBoardNames,
        leaderboard=leaderBoard,
        joined=joined,
        isbd=isbd,
        tdy=datetime.datetime.now().strftime("%m-%d")
        )

@app.route('/signup', methods=['POST'])
def signup():
    name = request.form['name']
    pw = request.form['pw']
    mail = request.form['mail']
    birthday = request.form['birthday']
    joined = datetime.datetime.now().strftime("%d/%m/%Y")
    if name in data.keys():
        flash("Username taken!", category="error")
        return redirect("/")
    if mail in data.keys():
        flash("Email taken!", category="error")
        return redirect("/")        
    data[name] = {
        "pw":hasher(pw),
        "mail":mail,
        "birthday":birthday,
        "joined":joined,
        "points":0
    }
    if len(data.keys()) <= 10:
        data[name]['points'] += 10
    saveJson()
    cookie = make_response(redirect("/"))
    cookie.set_cookie('name', name)
    cookie.set_cookie('pw', pw)
    flash("Account Created!", category="success")
    return cookie

@app.route('/logout')
def logout():
    cookie = make_response(redirect("/"))
    cookie.set_cookie('name', "")
    cookie.set_cookie('pw', "")
    return cookie

@app.route('/login', methods=['POST'])
def login():
    name = request.form['name']
    pw = request.form['pw']
    if auth(name, pw):

        flash("Logged in!", category="success")    
        cookie = make_response(redirect("/"))
        cookie.set_cookie('name', name)
        cookie.set_cookie('pw', pw)
        return cookie
    flash("Username or password is incorrect", category="error")
    return redirect("/")

@app.route('/new-post', methods=['POST'])
def new_post():
    code = request.form['code']
    name = request.cookies.get('name')
    pw = request.cookies.get('pw')
    lang = request.form['lang']
    if auth(name, pw):
        if len(code) > 7000:
            flash("Max code length is 7000 chars!", category="error")
            return redirect("/")
        id = len(posts.keys()) + 1
        posts[str(id)] = {
            "author":name,
            "likes":[],
            "date":datetime.datetime.now().strftime("%Y/%m/%d-%H:%M:%S"),
            "code":code,
            "lang":lang
        }
        saveJson()
        flash("Posted Code Block!", category="success")
        return redirect("/")
    flash("Please login!", category="error")
    return redirect("/")


@app.route('/like', methods=['POST'])
def like():
    id = str(request.form['id'])
    name = request.cookies.get('name')
    pw = request.cookies.get('pw')
    if auth(name, pw):
        if id in posts.keys():
            if name in posts[id]['likes']:
                posts[id]['likes'].remove(name)
                r = "unlike"
                if posts[id]['author'] != name:
                    data[posts[id]['author']]['points'] -= score
            else:
                posts[id]['likes'].append(name)
                if posts[id]['author'] != name:
                    data[posts[id]['author']]['points'] += score
                r = "like"
            saveJson()
            return jsonify({"res":r})
        return "False"
    return jsonify({"res":"login_please"})


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
    
#logo by karim and website by kar1m         
