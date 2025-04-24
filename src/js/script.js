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

const URL = 'https://3000-idx-to-do-1745143115351.cluster-3gc7bglotjgwuxlqpiut7yyqt4.cloudworkstations.dev/tasks'

async function get_Tasks() {
    try {
        const resp = await fetch(URL)
        const data = await resp.json()
        return data
    } catch (err) {
        return err
    }
}

async function post_Tasks() {
    try {
        const taskData = {
            title: inputTitle.value,
            description: inputDesc.value,
            status: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        
        let options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(taskData)
        }
        
        const resp = await fetch(URL, options)
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
        const del_url = URL + "/" + taskElem.id
        console.log(del_url)
        const resp = await fetch(del_url, {
            method: "DELETE"
        }) 
        const data = await resp.json()
        location.reload()
        return data
        
    } catch (err) {
        return err
    }
}

async function edit_Task(taskElem) {
    try {
        let edit_url = URL + "/" + taskElem.id
        let options = {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: taskElem.id,
                title: editTaskTitle.value,
                description: editTaskDesc.value,
                status: editTaskCompleted.checked,
                updatedAt: Date.now()
            })
        }
        const resp = await fetch(edit_url, options)
        if (!resp.ok) {
            throw new Error(`Server error: ${resp.status}`)
        } 
        const data = await resp.json()
        location.reload()
        return data;

    } catch (err) {
        console.error("Error posting task: ", err)
        alert("Failed to post task.")
        return null
    }
}

function open_modal(taskElem) {
    editTaskTitle.value = taskElem.title
    editTaskDesc.value = taskElem.description
    editTaskCompleted.checked = taskElem.status
    modalBG.style.display = "block"

    closeModal.addEventListener('click', () =>{
        modalBG.style.display = 'none'
    })

    saveTask.addEventListener('click', () => {
        modalBG.style.display = 'none'
        edit_Task(taskElem)
    })
}

function display_Tasks(taskArr) {
    taskArr.forEach(taskElem => {
        console.log(taskElem)

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
        taskCompleted.checked = taskElem.status

        // changes border and box shadow color depending on status
        task.style.borderColor = taskCompleted.checked ? 'rgb(151, 228, 151)' : 'rgb(236, 127, 127)'
        task.style.boxShadow = taskCompleted.checked ? '0 0 8px rgb(151, 228, 151)' : '0 0 8px rgb(236, 127, 127)'
        taskCompleted.addEventListener('change', () => {
            task.style.borderColor = taskCompleted.checked ? 'rgb(151, 228, 151)' : 'rgb(236, 127, 127)'
            task.style.boxShadow = taskCompleted.checked ? '0 0 8px rgb(151, 228, 151)' : '0 0 8px rgb(236, 127, 127)'
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

get_Tasks()
.then(taskArr => {
    taskArray = taskArr
    console.log(taskArray)
    display_Tasks(taskArray)
})
.catch(err => console.log(err))

addTask.addEventListener('click', async (e) => {
    e.preventDefault()

    if (inputTitle.value.trim() !== "") {
        const newTask = await post_Tasks()
        if (newTask) {
            inputTitle.value = ""
            inputDesc.value = ""
            location.reload()
  
        } else{
            console.warn("Server returned invalid task:", newTask)
        }
    }
})

