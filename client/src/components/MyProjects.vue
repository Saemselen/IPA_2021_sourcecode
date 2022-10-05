<!--

 * Path: '/client/src/components/MyProjects.vue'
 * Author: Samis Moser
 * Desc: Component for 'My Projects'-Page

-->
<template>
    <div class="content">
        <div class="myProjects" v-if="!data.projectActive">
            <button class="add" @click="toggleNewProject(true)">
                Neues Projekt erstellen
            </button>
            <div class="results" v-if="data.myProjects.length > 0">
                <h2>Meine Projekte</h2>
                <table>
                    <tr>
                        <th>Projekttitel</th>
                        <th>Start</th>
                        <th>Ende</th>
                        <th>Status</th>
                    </tr>
                    <tr v-for="project in data.myProjects" v-bind:key="project.ID" class="projectRow" @click="openProject(project.ID)">
                        <td>{{project.title}}</td>
                        <td>{{project.start}}</td>
                        <td>{{project.end}}</td>
                        <td>{{project.status}}</td>
                    </tr>
                </table>
            </div>
        </div>
        <Project @projectDeleted="projectCreated()" @projectClosed="closeProject()" :projectID="data.projectID" v-if="data.projectActive" />
        <NewProject @newProjectCreated="projectCreated()" @newProjectClosed="toggleNewProject(false)" v-if="data.newProjectActive" />
    </div>
</template>

<script>
// imports
import { reactive } from "vue"

// import config-file
import config from "../config.json"

// import used local components
import NewProject from "./NewProject.vue"
import Project from "./Project.vue"

export default {
    components: {
        NewProject,
        Project
    },
    setup() {
        // set up reactive variable to manipulate DOM
        const data = reactive({projectID:"0",myProjects:[],newProjectActive:false,projectActive:false})

        // function to decode JWT-Payload ( used to get information about
        // the user logged in )
        const decodeTokenPayload = (token) => {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }

        // function to convert UNIX-Timestamp to date-String
        // example: 1583020800000 => "2020-03-01"
        const convertDate = (UNIXtimestamp) => {
            var a = new Date(UNIXtimestamp)
            var year = a.getFullYear()
            var month = a.getMonth()+1
            if(month < 10) {
                month = "0"+month
            }
            var date = a.getDate()
            if(date < 10) {
                date = "0"+date
            }
            var result = `${year}-${month}-${date}`
            return result
        }

        // function to open project component for specific project
        const openProject = (id) => {
            data.projectID = JSON.stringify(id)
            data.projectActive = true
        }

        // function to toggle "New Project"-Component
        const toggleNewProject = (mode) => {
            data.newProjectActive = mode
        }

        // function to fetch all projects where ownerID == ID of logged in user
        const fetchProjects = async () => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                }
            }
            let userID = decodeTokenPayload(localStorage.jwt).uid
            // api-call [ GET '/api/projects/getByUser' ]
            // query-Strings ( URL ):
            // - uid ( integer )
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/getByUser?uid=${userID}`
        
            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()
            if(result.data !== undefined) {
                result.data.forEach((res, index) => {
                    res.start = convertDate(res.start)
                    res.end = convertDate(res.end)
                    if(res.status === null) res.status = "-"
                })
                
                
                data.myProjects = result.data
            }
        }

        // function to close project component
        const closeProject = () => {
            data.projectActive = false
        }

        // function to re-fetch Projects after a new project
        // has been created
        const projectCreated = async () => {
            fetchProjects()
            data.projectActive = false
        }


        // fetch all user-projects on page setup
        fetchProjects()
        
        return { data, openProject, toggleNewProject, closeProject, projectCreated }
    }
}
</script>

<style scoped>
.content {
    display: block;
    text-align: center;
    margin-top:5%;
    color:rgb(37, 37, 37);
}
.results, .add {
    background: #fff;
    width: 70%;
    box-shadow: 1px 1px 5px rgb(139, 139, 139);
    padding: 30px;
    border-radius: 7px;
}
.results  {
    margin-left: 15%;
    margin-top: 10px;
}
.add {
    border: 2px solid rgb(58, 58, 58);
    cursor: pointer;
    font-weight: bold;
    font-size: 14pt;
}
.add:hover {
    color:#00aaed;
    border-color:#00aaed;
    box-shadow: 2px 2px 7px rgb(139, 139, 139);
}
.results h2 {
    text-align: left;
}
table {
    border-collapse: collapse;
    width: 100%;
}
table th, table td {
    padding: 20px;
}
.projectRow {
    cursor:pointer;
}
.projectRow:hover {
    background:#ebebeb;
}

</style>