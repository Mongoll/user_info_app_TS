const modal = document.getElementById("myModal") as HTMLElement
modal.style.visibility = "hidden"
const modUserlogin = document.getElementById('login') as HTMLElement
const modUserName = document.getElementById('fullName') as HTMLElement
const modUserRepoCount = document.getElementById('repoCount') as HTMLElement
const modUserImg = document.getElementById('avatar') as HTMLElement
const modUserLink = document.getElementById('link') as HTMLElement
const modUserFollCount = document.getElementById('followersCount') as HTMLElement 
const modUserRepos = document.getElementById('repo') as HTMLElement
const modFollBlock = document.getElementById('foll') as HTMLElement
const modLangBlock = document.getElementById('lang') as HTMLElement

interface Repo {
    name: string;
    html_url: string;
    language: string;
    full_name: string;
}

interface Follower{
    login: string;
    html_url: string;
    avatar_url: string
}

interface User {
    html_url: string
    avatar_url: string
    login: string
    site_admin: boolean
    repos_url: string
    public_repos: string
    followers: number
    name: string
}

// get users list
async function fetchUsersJSON() {
    const response = await fetch('https://api.github.com/users',{
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}});
    const users = await response.json();
    return users;
}


//button event for create users list
function fetchUsers() {
    fetchUsersJSON().then(data => {
        let users = createList(data);
    });
} 

//get info about user
async function fetchUserRepoFollowers(userName: string) {
    const [userResponse, repoResponse, followerResponse] = await Promise.all([
      fetch(`https://api.github.com/users/${userName}`,{
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}}),
      fetch(`https://api.github.com/users/${userName}/repos?per_page=100`,{
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}}),
      fetch(`https://api.github.com/users/${userName}/followers`,{
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}})
    ]);
    if (!userResponse.ok) {
        const message = `User not found. Status code: ${userResponse.status}`;
        throw new Error(message);
    }
    const user = await userResponse.json();
    const repo = await repoResponse.json();
    const followers = await followerResponse.json();
    return [user, repo, followers];
  }

  async function fetchUserRepoLanguages(repoName: string) {
    const languagesResponse = await fetch(`https://api.github.com/repos/${repoName}/languages`,{
        method: "GET",
        headers: {"Content-type": "application/json;charset=UTF-8"}})
    if (!languagesResponse.ok) {
        const message = `Languages in repo ${repoName} not found. Status code: ${languagesResponse.status}`;
        throw new Error(message);
    }
    const repoLanguages = await languagesResponse.json();
    return repoLanguages;
  }

//create user list
const createList = (users: User[]) => {
    const form = document.getElementById("user-list") as HTMLElement
    form.innerHTML = ''
    users.forEach(user => {
        const user_block = document.createElement("div")
        const user_name = document.createElement("lable")
        const avatar = document.createElement("img")
        user_block.className = 'mini-user-block'
        user_block.setAttribute('onclick', `searchBtn("${user.login}")`)
        user_name.innerText = user.login
        avatar.setAttribute('src',`${user.avatar_url}`)
        avatar.setAttribute('alt',`${user.login}`)
        avatar.setAttribute('class','minImg')
        user_block.appendChild(avatar)
        user_block.appendChild(user_name)
        form.appendChild(user_block)
    })
}
  
function searchBtn(userName = (<HTMLInputElement>document.getElementById('nameInp')).value){
    if (userName) {
        fetchUserRepoFollowers(userName).then(([user, repo, followers]) => {
            userInfo(user)     // fetched user
            repoInfo(repo)    // fetched repo  
            followerInfo(followers) // fetched followers
            modal.style.visibility = 'visible'
        }).catch(error => {
            alert(error.message); // 'An error has occurred: 404'// /user request failed
        });    
    }else {
        alert("Search field should not be blank")
    }
}

const langBtn = (repoLanguage: string) => {
    let langId = repoLanguage
    fetchUserRepoLanguages(repoLanguage).then(repoLanguages =>{
        let userRepoLang = languagesInfo(repoLanguages, langId)
    }).catch(error => {
        alert(error.message);
    })
    let lengBtn = document.getElementById(repoLanguage) as HTMLElement
    lengBtn.className = "hide";
}

//clear modal body when close
function cancelModal(){
    modal.style.visibility = 'hidden'
    modUserlogin.innerHTML = ''
    modUserName.innerHTML = ''
    modUserRepoCount.innerHTML = ''
    modUserImg?.setAttribute('src','')
    modUserImg?.setAttribute('alt','')
    modUserLink?.setAttribute('href', '')
    modUserLink.innerHTML = ''
    modUserFollCount.innerHTML = ''
    modUserRepos.innerHTML = ''
    modFollBlock.innerHTML = ''
}

// create user info
const userInfo = (user: User) => {
    modUserlogin.innerHTML = user.login
    modUserName.innerHTML = user.name
    modUserRepoCount.innerHTML = user.public_repos
    modUserImg?.setAttribute('src',`${user.avatar_url}`)
    modUserImg?.setAttribute('alt',`Image of ${user.login}`)
    modUserLink?.setAttribute('href', user.html_url)
    modUserLink.innerHTML = user.html_url
    modUserFollCount.innerHTML = " " + user.followers
}

// create user repo + repo lang info
const repoInfo = (repo: Repo[]) => {
    if (repo.length > 0){
        //add list of languages
        let lang = repo.map(repo => repo.language)
        .filter(el => el !== null)
        .reduce((acc, count) => {
            acc[count] = (acc[count] || 0) + 1;
            return acc;
        }, {})
        for (const [key, value] of Object.entries(lang)){
            const langBlockP = document.createElement('p')
            langBlockP.innerHTML = `${key}: ${value}`
            modLangBlock.appendChild(langBlockP)
        }
        //add list of repos
        const repoBlock1 = document.createElement('div')
        const repoh3 = document.createElement('h3')
        repo.forEach(repo => {
            const repoBlock2 = document.createElement('div')
            const repoLink = document.createElement('a')
            const repoName = document.createElement('p')
            const repoLang = document.createElement('button')
            repoBlock2.setAttribute("id", `${repo.full_name}div`)
            repoLink.setAttribute('href', `${repo.html_url}`)
            repoLink.setAttribute('target','_blank')
            repoLink.className = 'repoLink'
            repoName.innerHTML = `Name: ${repo.name}`
            repoBlock2.className = 'repoBlock'
            repoLang.className = 'dropbtn'
            repoLang.innerHTML = `Show language(s)`
            repoLang.setAttribute('onclick',`langBtn('${repo.full_name}')`)
            repoLang.setAttribute('id',`${repo.full_name}`)
            repoBlock1.setAttribute('id', 'repoBlock')
            repoh3.innerHTML = 'Repositories list:'
            repoLink.appendChild(repoName)
            repoBlock2.appendChild(repoLink)
            repoBlock2.appendChild(repoLang)
            repoBlock1.appendChild(repoBlock2)
        })
        modUserRepos?.appendChild(repoh3)
        modUserRepos?.appendChild(repoBlock1)
    }
}
const languagesInfo = (repoLanguages:[], langId: string) => {
    let dropdownLang = document.getElementById(langId+"div") as HTMLElement
    for (const [key, value] of Object.entries(repoLanguages)){
        const langBlockP = document.createElement('p')
        langBlockP.innerHTML = `${key}`
        dropdownLang.appendChild(langBlockP)
    }
}
//create user followers info
const followerInfo = (followers: Follower[]) => {
    if (followers.length > 0){
        const follBlock1 = document.createElement('div')
        const follh3 = document.createElement('h3')
        followers.forEach(follow =>{ 
            const follBlock2 = document.createElement('div')
            const follLink = document.createElement('a')
            const follName = document.createElement('lable')
            const follImg = document.createElement('img')
            follImg.setAttribute('src', follow.avatar_url)
            follImg.setAttribute('alt', `Follower ${follow.login}`)
            follLink.setAttribute('href', `${follow.html_url}`)
            follLink.setAttribute('target','_blank')
            follName.innerHTML = follow.login
            follh3.innerHTML = 'Followers list:'
            follBlock2.className = 'follBlock'
            follBlock1.setAttribute('id','follBlock')
            follBlock2.appendChild(follLink)
            follLink.appendChild(follImg)
            follLink.appendChild(follName)
            follBlock1.appendChild(follBlock2)
        })
        modFollBlock?.appendChild(follh3)
        modFollBlock?.appendChild(follBlock1)
    }
}