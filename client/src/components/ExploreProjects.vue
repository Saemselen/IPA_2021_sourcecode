<!--

 * Path: '/client/src/components/ExploreProjects.vue'
 * Author: Samis Moser
 * Desc: Component to explore projects and search for projects

-->
<template>
<div class="wrapper">
    <div class="explorecontent">
        <div class="inputs" v-if="!data.projectActive">
            <div class="col" id="col1">
                <h2>Projektübersicht</h2>
                <input type="text" placeholder="Suche.." @input="searchProjects($event)">
            </div>
            <div class="col" id="col2">
                <h3>Klasse</h3>
                <div v-for="c in data.classes" v-bind:key="c">
                    <input type="checkbox" :id="c" @click="toggleClass(c)" :checked="true">
                    <label>{{c}}</label><br>
                </div>
            </div>
            <div class="col" id="col3">
                <h3>Export</h3>
                <Export :data="[data.exportData]" filename="projects" />
            </div>
        </div>
        <div class="results" v-if="!data.projectActive">
            <h2 v-if="!data.found">Es wurden keine Projekte gefunden</h2>
            <table v-if="data.found">
                <tr class="header">
                    <th>Projekttitel</th>
                    <th>Start</th>
                    <th>Ende</th>
                    <th>Projektleiter</th>
                    <th>Status</th>
                </tr>
                <tr v-for="result of data.results" v-bind:key="result.ID" @click="openProject(result.ID)">
                    <td>{{result.title}}</td>
                    <td>{{convertDate(result.start)}}</td>
                    <td>{{convertDate(result.end)}}</td>
                    <td>{{result.owner}}</td>
                    <td v-if="result.status != null">{{result.status}}</td>
                    <td v-if="result.status == null">-</td>

                </tr>
            </table>
            
        </div>
    </div>
    <Project  @projectDeleted="closeProject()" @projectClosed="closeProject()" :projectID="data.projectID" v-if="data.projectActive" />
</div>
</template>

<script>
// imports
import { reactive } from "vue"

// import config-file
import config from "../config.json"

// import used local components
import Project from "./Project.vue"
import Export from "./Export.vue"

export default {
    components: {
        Project,
        Export
    },
    setup() {
        // set up reactive variable to manipulate DOM
        const data = reactive({found:true,classesSelected:[],classes:[],results:[],projectID:"",projectActive:false,exportData:[]})

        // error function (sends JavaScript-alert with specific message)
        const error = (message) => {
            alert(`Fehler, ${message}`)
        }

        // function to search for projects
        // gets called on change of input element ( searchbar )
        const searchProjects = async () => {
            let fetchOptions = {
                "method": "POST",
                "headers": {
                    "Content-Type":"application/json",
                    "authorization": localStorage.jwt
                },
                "body": JSON.stringify({
                    "query": event.target.value,
                    "classes": data.classesSelected
                })
            }
            // api-call [ POST '/api/projects/search' ]
            // request-body: 
            // - query: Search-Query ( String )
            // - classes: Array of classes to search projects from
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/search`

            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()

            if(result.status) {
                data.results = result.data
                data.results.forEach(async project => {
                    project.owner = await getOwner(project.ownerID)
                })

                data.exportData = data.results
            } 
            else {
                data.found = false
            }
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

        
        // function to enable project component for specific project
        const openProject = (id) => {
            data.projectID = JSON.stringify(id)
            data.projectActive = true
        }

        // function to disable project component
        const closeProject = () => {
            data.projectActive = false
        }

        // function to fetch ALL projects on page setup
        const fetchAllProjects = async () => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                }
            }
            // api-call [ GET '/api/projects/getAll' ] 
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/getAll`
            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()


            if(!result.status) {
                error(result.message)
            }
            else {
                data.results = result.data
            }
        }

        // function to get Fullname of local user (from UserID)
        const getOwner = async (id) => {
            // api-call [ GET '/api/users/getLocalUserByID' ]
            // query-Strings ( URL ):
            // - uid ( integer )
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getLocalUserByID?uid=${id}`
            let response = await fetch(api_url)
            let result = await response.json()

            // return attribute 'fullname' of user-object
            return result.data.fullname
        }

        // function to add / remove class from reactive Array
        // (if checkbox is clicked)
        const toggleClass = async (id) => {
            let elem = document.getElementById(id)
            let classes = []
            if(elem.checked) {
                // add class
                data.classesSelected.push(elem.id)
            }
            else {
                // remove class
                data.classesSelected.forEach(selectedClass => {
                    if(selectedClass != elem.id) {
                        classes.push(selectedClass)
                    }
                })
                data.classesSelected = classes
            }

            
        }

        // function to fetch all classes on page setup
        const fetchClasses = async () => {
            // api-call [ GET '/api/users/getAllClasses' ]
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getAllClasses`

            let response = await fetch(api_url)
            let result = await response.json()

            if(!result.status) {
                error(result.message)
            }
            else {
                data.classes = result.data
            }
        }

        setTimeout(async() => {
            // fetch classes & projects on page setup
            await fetchClasses()
            await fetchAllProjects()

            // set ExportData (used for exports in JSON and CSV format)
            data.exportData = data.results

            // set selected classes ( checkboxes ) to all classes on page setup
            data.classesSelected = data.classes

            // get project owner names for each project in the list
            data.results.forEach(async project => {
                project.owner = await getOwner(project.ownerID)
            })
        },100)

        return { data, convertDate, getOwner, openProject, toggleClass, closeProject, searchProjects }
    }    
}
</script>

<style scoped>
.wrapper {
    width: 100%;
}
.explorecontent {
    text-align: center;
    display:block;
    margin-top:2%;
    padding:30px;
    width: 70%;
    margin-left:15%;
    margin-right:15%;
}
.inputs {
    margin-bottom: 15px;
}
.inputs, .results{
    padding:30px;
    background:#fff;
    border-radius: 7px;
    box-shadow: 1px 1px 2px #b8b8b8;
}
.results {
    text-align: center;
}
.col {
    display: inline-block;
    margin: 5%;
}
.results  {
    text-align: center;
}
table {
    border-collapse: collapse;
    width: 100%;
}
table th, table td {
    padding: 20px;
}
table tr:hover {
    cursor: pointer;
    background:#ebebeb;
}
.header:hover {
    background:#fff;
}
#col1 h2 {
    margin-bottom: 20px;
}
#col1 input {
    border: 1px solid #b8b8b8;
    border-radius: 7px;
    height: 30px;
    padding: 5px;
    box-shadow: 1px 1px 2px #b8b8b8;
    min-width: 250px;
}
</style>