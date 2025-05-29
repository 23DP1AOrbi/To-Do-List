const taskContainer = document.querySelector('.task-container')
const inputTitle = document.getElementById('input-task')
const inputDesc = document.getElementById('input-description')
const addTask = document.getElementById('add-task')

const modalBG = document.querySelector('.modal-background')
const closeModal = document.querySelector('#close-modal')
const editTaskTitle = document.getElementById('edit-task-title')
const editTaskDesc = document.getElementById('edit-task-description')
const editTaskCompleted = document.getElementById('edit-task-completed')
const saveTask = document.getElementById('save-task')

let taskArray = []

const URL = 'https://5500-idx-to-do-1745143115351.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev'
const TASKS_URL = `${URL}/tasks`
const LOGIN_URL = `${URL}/users/login`
const SIGNUP_URL = `${URL}/users/signup`

const signupUsername = document.getElementById('signup-username')
const signupPassword = document.getElementById('signup-password')
const signupBtn = document.getElementById('signup-btn')

const loginUsername = document.getElementById('login-username')
const loginPassword = document.getElementById('login-password')
const loginBtn = document.getElementById('login-btn')

// for switching the beginning screen
const entryBG = document.getElementById('entry-bg')
const registerSection = document.querySelector('.register')
const loginSection = document.querySelector('.login')

const switchToLoginBtn = document.getElementById('switch-to-login')
const switchToRegisterBtn = document.getElementById('switch-to-register')

const logoutBtn = document.getElementById('logout-btn')



async function get_Tasks() {
    try {
        const token = localStorage.getItem('token')
        const resp = await fetch(TASKS_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        if (!resp.ok) {
            throw new Error('Failed to fetch tasks')
        }
        const data = await resp.json()
        return data
    } catch (err) {
        console.error('Error fetching tasks:', err)
        alert('Please log in to view your tasks.')
        return []
    }
}

async function post_Tasks() {
    try {
        const token = localStorage.getItem('token')
        const taskData = {
            title: inputTitle.value,
            description: inputDesc.value,
            status: "incomplete",
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        
        const resp = await fetch(TASKS_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(taskData)
        })

        if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`)
        }
        const data = await resp.json()
        return data;

    } catch (err) {
        console.error("Error posting task: ", err)
        alert("Failed to post task.")
        return null
    }
}

async function del_Task(taskElem) {
    try {
        const token = localStorage.getItem('token')
        const del_url = TASKS_URL + "/" + taskElem._id
        console.log(del_url)
        const resp = await fetch(del_url, {
            method: "DELETE",
            headers: {
            'Authorization': `Bearer ${token}`
            }
        }) 
        const data = await resp.json()

        taskArray = taskArray.filter(task => task._id !== taskElem._id)
        taskContainer.innerHTML = ""
        display_Tasks(taskArray)

        return data
        
    } catch (err) {
        return err
    }
}

async function edit_Task(taskElem) {
    try {
        let edit_url = TASKS_URL + "/" + taskElem._id
        let updatedStatus = editTaskCompleted.checked ? "completed" : "incomplete"

        const token = localStorage.getItem('token')
        let options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                id: taskElem.id,
                title: editTaskTitle.value,
                description: editTaskDesc.value,
                status: updatedStatus,
                updatedAt: Date.now()
            })
        }
        const resp = await fetch(edit_url, options)
        if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`)
        } 

        const updatedTask = await resp.json()

        const index = taskArray.findIndex(t => t._id === taskElem._id)
        if (index !== -1) {
            taskArray[index] = updatedTask
            taskContainer.innerHTML = ""
            display_Tasks(taskArray)
        }
        return updatedTask

    } catch (err) {
        console.error("Error posting task: ", err)
        alert("Failed to post task.")
        return null
    }
}

function open_modal(taskElem) {
    editTaskTitle.value = taskElem.title
    editTaskDesc.value = taskElem.description
    editTaskCompleted.checked = taskElem.status === "completed"
    modalBG.style.display = "block"

    closeModal.addEventListener('click', () =>{
        modalBG.style.display = 'none'
    })

    saveTask.onclick = () => {
        modalBG.style.display = 'none'
        edit_Task(taskElem)
    }
}

function display_Tasks(taskArr) {
    taskArr.forEach(taskElem => {

        // Parent
        let task = document.createElement('div')
        task.classList.add('task')

        // Children
        let taskInfo = document.createElement('div')
        taskInfo.classList.add('task-info')
        let taskBtn = document.createElement('form')
        taskBtn.classList.add('task-btn')

        // Grandchildren
        // status
        let taskCompleted = document.createElement('input')
        taskCompleted.classList.add('task-completed')
        taskCompleted.setAttribute('type', 'checkbox')
        taskCompleted.checked = taskElem.status === "completed"

        // changes border and box shadow color depending on status
        task.style.borderColor = taskCompleted.checked ? 'rgb(151, 228, 151)' : 'rgb(236, 127, 127)'
        task.style.boxShadow = taskCompleted.checked ? '0 0 8px rgb(151, 228, 151)' : '0 0 8px rgb(236, 127, 127)'
        taskCompleted.addEventListener('change', async () => {
            task.status = taskCompleted.checked ? "completed" : "incomplete"

            task.style.borderColor = taskCompleted.checked ? 'rgb(151, 228, 151)' : 'rgb(236, 127, 127)'
            task.style.boxShadow = taskCompleted.checked ? '0 0 8px rgb(151, 228, 151)' : '0 0 8px rgb(236, 127, 127)'

            await edit_Task(taskElem)
        })
        // title
        let taskTitle = document.createElement('p')
        taskTitle.classList.add('task-title')
        taskTitle.innerHTML = taskElem.title

        // description
        let taskDesc = ""
        if (taskElem.description && taskElem.description.trim() !== "") {
            taskDesc = document.createElement('p')
            taskDesc.classList.add('task-description')
            taskDesc.innerHTML = taskElem.description
        }
        

        // edit button
        let taskEdit = document.createElement('button')
        taskEdit.classList.add('task-edit')
        taskEdit.innerHTML = "Edit"
        taskEdit.addEventListener('click', e => {
            e.preventDefault()
            open_modal(taskElem)
        })

        // delete button
        let taskDel = document.createElement('button')
        taskDel.classList.add('task-delete')
        taskDel.innerHTML = "Delete"
        taskDel.addEventListener('click', e => {
            e.preventDefault()
            console.log("Deleted task")
            del_Task(taskElem)
        })

        // adds fields adds fields in their places for html
        taskInfo.appendChild(taskTitle)
        // only adds description if there is one
        if (taskElem.description && taskElem.description.trim() !== "") {
            taskInfo.appendChild(taskDesc)
        }

        taskBtn.appendChild(taskEdit)
        taskBtn.appendChild(taskDel)

        task.appendChild(taskCompleted)
        task.appendChild(taskInfo)
        task.appendChild(taskBtn)

        taskContainer.appendChild(task)
    });
}



addTask.addEventListener('click', async (e) => {
    e.preventDefault()

    if (inputTitle.value.trim() !== "") {
        const newTask = await post_Tasks()
        if (newTask) {
            inputTitle.value = ""
            inputDesc.value = ""

            taskArray.push(newTask)
            taskContainer.innerHTML = ""
            display_Tasks(taskArray)
  
        } else{
            console.warn("Server returned invalid task:", newTask)
        }
    }
})


loginBtn.addEventListener('click', async () => {
  const username = loginUsername.value.trim()
  const password = loginPassword.value.trim()

  if (!username || !password) {
    alert('Username and password required')
    return
  }

  try {
    const res = await fetch(LOGIN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()
    console.log("Login response:", data)

    if (!res.ok || !data.token) {
        throw new Error('Login failed or invalid token')
    } 

    localStorage.setItem('token', data.token)
    localStorage.setItem('username', username)
    // alert('Login successful!')

    loginUsername.value = ''
    loginPassword.value = ''

    showTasks()

    await loadUserTasks()
  } catch (err) {
    console.error('Login error:', err)
    alert('Login failed: ' + err.message)
  }
})

signupBtn.addEventListener('click', async () => {
  const username = signupUsername.value.trim()
  const password = signupPassword.value

  if (password.length < 6) {
        alert('The password has to be at least 6 characters')
        return
    }

  try {
    const res = await fetch(SIGNUP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    })

    if (res.status === 409) {
      alert('User already exists. Please choose a different username.');
      return;
    }

    if (!res.ok) {
      const errorData = await res.json();
      alert(errorData.message || 'Signup failed');
      return;
    }

    alert('Signup successful! Now log in.')
    signupUsername.value = ''
    signupPassword.value = ''
  } catch (err) { 

    console.error(err)
    alert('Signup error')
  }
})

async function loadUserTasks() {
    const tasks = await get_Tasks()
    taskArray = tasks
    taskContainer.innerHTML = ''
    display_Tasks(taskArray)
}

if (localStorage.getItem('token')) {
    showTasks()
    loadUserTasks()
}


function showTasks() {
    registerSection.classList.add('hidden')
    loginSection.classList.add('hidden')
    entryBG.style.display = 'none'

    updateHeader()
}

function updateHeader() {
    const username = localStorage.getItem('username')
    const header = document.getElementById('username')
    if (username) {
        header.innerText = `To-Do List - ${username}`
    }
}

function showLogin() {
    registerSection.classList.add('hidden')
    loginSection.classList.remove('hidden')
}

function showRegister() {
    loginSection.classList.add('hidden')
    registerSection.classList.remove('hidden')
}

// Button to switch views
switchToLoginBtn.addEventListener('click', showLogin)
switchToRegisterBtn.addEventListener('click', showRegister)


logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    taskContainer.innerHTML = ''
    inputTitle.value = ''
    inputDesc.value = ''

    entryBG.style.display = 'flex'
    loginSection.classList.remove('hidden')
    registerSection.classList.add('hidden')
})