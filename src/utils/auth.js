const USERS_KEY = 'dots_users_v1'
const CUR_USER_KEY = 'dots_current_user_v1'

function readUsers(){
  try{
    const raw = localStorage.getItem(USERS_KEY)
    return raw? JSON.parse(raw) : []
  }catch(err){
    console.error(err)
    return []
  }
}

function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function getCurrentUser(){
  try{
    const raw = localStorage.getItem(CUR_USER_KEY)
    return raw? JSON.parse(raw) : null
  }catch(err){
    console.error(err)
    return null
  }
}

function setCurrentUser(user){
  if(user) localStorage.setItem(CUR_USER_KEY, JSON.stringify(user))
  else localStorage.removeItem(CUR_USER_KEY)
  // notify other parts of the app
  try{ window.dispatchEvent(new Event('authChanged')) }catch(err){ console.debug('auth event dispatch failed', err) }
}

function signup({name,email,password}){
  const users = readUsers()
  if(users.find(u=>u.email===email)){
    throw new Error('A user with that email already exists')
  }
  const user = {id: Date.now(), name, email, password}
  users.push(user)
  saveUsers(users)
  setCurrentUser({id:user.id,name:user.name,email:user.email})
  return user
}

function login({email,password}){
  const users = readUsers()
  const u = users.find(x=> x.email===email && x.password===password)
  if(!u) throw new Error('Invalid email or password')
  setCurrentUser({id:u.id,name:u.name,email:u.email})
  return u
}

function logout(){
  setCurrentUser(null)
}

export { readUsers, getCurrentUser, signup, login, logout }
