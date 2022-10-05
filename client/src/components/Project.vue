<!--

 * Path: '/client/src/components/Project.vue'
 * Author: Samis Moser
 * Desc: Project-Component

-->
<template>
    <div class="wrapper" @click="closeProject()">
        <div class="content" v-if="!data.editProjectActive">
            <div class="info">
                <div class="titleRow">
                    <h1>{{data.projectData.title}}</h1>
                    <button v-if="data.projectData.ownerID == data.userData.uid || data.userData.perm == 'Lehrperson'" @click="toggleEditProject(true)"><i class="gg-options"></i></button>
                </div>
                <div class="infoRow">
                    <div class="infos">
                        <div>
                            <label>Projektleiter:</label>
                            <p>{{data.projectData.owner}}</p>
                        </div>
                        <div>
                            <label>Auftraggeber:</label>
                            <p>{{data.projectData.client}}</p>
                        </div>
                        <div>
                            <label>Projektdauer:</label>
                            <p>{{data.projectData.dateString}}</p>
                        </div>
                        <div>
                            <label>Teilnehmer:</label>
                            <p>{{data.projectData.contributors}}</p>
                        </div>
                        <div>
                            <label>Technologien:</label>
                            <p>{{data.projectData.technologies}}</p>
                        </div>
                        <div>
                            <label>Status:</label>
                            <p>{{data.projectData.status}}</p>
                        </div>
                    </div>
                    <div class="links">
                        <div v-if="data.projectData.gitlab != null && data.projectData.gitlab">
                            <a :href="data.projectData.gitlab" target="_blank">
                                
                                <p>GitLab-Repo</p>
                                <i class="gg-git-branch"></i>
                            </a>
                        </div>
                        <div v-if="data.projectData.trello != null && data.projectData.trello">
                            <a :href="data.projectData.trello" target="_blank">
                                
                                <p>Trello-Board</p>
                                <i class="gg-trello"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div class="descRow">
                    <label>Beschreibung:</label>
                    <p>{{data.projectData.desc}}</p>
                </div>
                <div class="exportRow">
                    <h2>Export</h2>
                    <Export :data="[data.exportData]" filename="project" />
                </div>
            </div>
            <Markdown v-if="data.markdown" :url="data.projectData.gitlab" />
        </div>
        <EditProject :projectID="JSON.stringify(data.projectData.ID)" @projectDeleted="projectDeleted()" @projectEdited="projectEdited()" @editClosed="toggleEditProject(false)" v-if="data.editProjectActive" />
    </div>
</template>

<script>
// imports
import { reactive } from "vue"

// import config-file
import config from "../config.json"

// import local used components
import Markdown from "./Markdown.vue"
import Export from "./Export.vue"
import EditProject from "./EditProject.vue"

export default {
    components: {
        Markdown,
        Export,
        EditProject
    },
    props: {
        projectID: String
    },
    setup(props, context) {
        // set reactive data object to manipulate the DOM
        const data = reactive({editProjectActive:false,projectData: {},userData:{},markdown:false,exportData:{}})
        
        // function to fetch data of specific project
        const fetchProjectData = (pid) => {
            return new Promise(async resolve => {
                let fetchOptions =  {
                    "method": "GET",
                    "headers": {
                        "Content-Type": "application/json",
                        "authorization": localStorage.jwt
                    }
                }
                // api-call [ GET '/api/projects/getProject' ]
                // query-Strings ( URL ):
                // - pid ( integer ) { ID of project }
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/getProject?pid=${pid}`
                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()

                data.projectData = result.data
                resolve(true)
            })
        }

        // function to reload 
        const projectEdited = async () => {
            await getValues()
        }

        // function to exit Project-Component if project has been deleted
        const projectDeleted = () => {
            context.emit("projectDeleted")
            document.getElementsByClassName("wrapper")[0].click()        
        }

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
        
        // function to fetch used technologies in specific project
        const getTechnologies = (projectID) => {
            return new Promise(async resolve => {
                let fetchOptions = {
                    "method": "GET",
                    "headers": {
                        "Content-Type": "application/json",
                        "authorization": localStorage.jwt
                    }
                }
                // api-call [ GET '/api/technologies/getByProjectID' ]
                // query-Strings ( URL ):
                // - pid ( integer ) { ID of project }
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/getByProjectID?pid=${projectID}`
                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()

                let responseString = ""
                    
                for(let tech of result.data) {
                    responseString += tech[0].title + ", "
                }

                responseString = responseString.substr(0,responseString.length-2)
                resolve(responseString)
            })
        }

        // function to create date-string from start and end timestamps
        // example:
        // getDateString(1583020800000,1583107200000)
        // => '01.03.2020 - 02.03.2020'
        const getDateString = (startUnix, endUnix) => {
            let start = {
                year: new Date(startUnix).getFullYear(),
                month: new Date(startUnix).getMonth()+1,
                date: new Date(startUnix).getDate()
            }
            if(start.month < 10) {
                start.month = "0"+start.month
            }
            if(start.date < 10) {
                start.date = "0"+start.date
            }
            let end = {
                year: new Date(endUnix).getFullYear(),
                month: new Date(endUnix).getMonth()+1,
                date: new Date(endUnix).getDate()
            }
            if(end.month < 10) {
                end.month = "0"+end.month
            }
            if(end.date < 10) {
                end.date = "0"+end.date
            }

            return `${start.date}.${start.month}.${start.year} - ${end.date}.${end.month}.${end.year}` 
        }

        // function to get UserObject from local user by ID
        const getOwner = async (id) => {
            // api-call [ GET '/api/users/getLocalUserByID' ]
            // query-Strings ( URL ):
            // - uid ( integer ) { ID of local user }
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getLocalUserByID?uid=${id}`
            let response = await fetch(api_url)
            let result = await response.json()

            if(result.status) {
                return result.data
            }
        }

        // function to get Fullname of every contributor of the project
        // parameter 'string' = 'libe,samo,ansc'
        const getContributors = (string) => {
            return new Promise(resolve => {
                // split string on ',' delimiter
                // 'libe,samo,ansc' => ['libe','samo','ansc']
                let contributors = string.split(",")
                let res = []
                // loop through contributors
                contributors.forEach(async contributor => {
                    // api-call [ GET '/api/users/getFullName' ]
                    // query-Strings ( URL ):
                    // - username ( String ) { sAMAccountName }
                    let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/users/getFullName?username=${contributor}`
                    let response = await fetch(api_url)
                    let result = await response.json()

                    res.push(result.fullname)
                })
                setTimeout(() => {
                    // build resString from Usernames
                    // example => 'Liam Benedetti, Samis Moser, Andrin Schranz'
                    if(res.length > 0) {
                        let resString = ""
                        res.forEach(name => {
                            resString += name + ", "
                        })
                        resString = resString.substring(0,resString.length-2)
                        resolve(resString)
                    } 
                },100) 
            })
        }

        // function to set object for export as JSON or CSV
        const setExportData = () => {
            return {
                ID: data.projectData.ID,
                title: data.projectData.title,
                start: convertDate(data.projectData.start),
                end: convertDate(data.projectData.end),
                description: data.projectData.desc,
                technologies: data.projectData.technologies.replace(/,/g,";"),
                contributors: data.projectData.contributors.replace(/,/g,";"),
                status: data.projectData.status 
            }
        }

        // function to close the Project-Component
        const closeProject = () => {
            if(event.target.classList[0] == "wrapper" && event.target.classList[0] != "mdcontent" || event.target.classList[0] == "content" && event.target.classList[0] != "mdcontent" ) {
                context.emit("projectClosed")
            }
        }

        // function to fetch projectData on page setup
        const getValues = async () => {
            await fetchProjectData(props.projectID)
            
            let owner = await getOwner(data.projectData.ownerID)

            data.userData.uid = decodeTokenPayload(localStorage.jwt).uid
            data.userData.perm = decodeTokenPayload(localStorage.jwt).perm

            data.projectData.owner = owner.fullname
            data.projectData.dateString = getDateString(data.projectData.start, data.projectData.end)
            if(data.projectData.contributors != null) {
                data.projectData.contributors = await getContributors(data.projectData.contributors)
            }
            else {
                data.projectData.contributors = "-"
            }
            if(data.projectData.status == null) {
                data.projectData.status = "-"
            }
            data.projectData.technologies = await getTechnologies(props.projectID)
            
            data.exportData = setExportData()

            if(data.projectData.gitlab != null && data.projectData.gitlab != "") {
                data.markdown = true
            }
        }
        if(props.projectID != "0") {
            setTimeout(async () => {
                // fetch project data on load
                await getValues()
            },200)
        }

        // function to toggle "Edit-Project"-Component
        const toggleEditProject = (mode) => {
            data.editProjectActive = mode
        }
        

        return { projectEdited, projectDeleted, data, closeProject, decodeTokenPayload, toggleEditProject }
    }
}
</script>

<style scoped>
.wrapper {
    width: 100%;
    height: 100vh;
}
.info, .markdown {
    background:#fff;
    margin-left:15%;
    margin-right:15%;
    text-align: left;
}
.info {
    padding:30px;
    min-height: 400px;
    box-shadow: 1px 1px 3px #b8b8b8;
    border-radius: 7px;
}
.titleRow, .infoRow, .descRow, .exportRow {
    display: block;
}
.titleRow h1, .titleRow button{
    display: inline-block;
}
.titleRow button {
    float:right;
}
label {
    font-weight: bold;
    margin-right: 5px;
}
.infos, .links {
    display: inline-block;
}
.links {
    float: right;
    padding: 10px;
}
.infos label, .infos p {
    display: inline-block;
}
.exportRow {
    float:right;
}
.infos div {
    margin-bottom: 8px;
}
h1 {
    font-size: 19pt;
    margin-bottom: 10px;
}
.descRow p {
    max-width: 500px;
}
.titleRow button {
    border:none;
    background:transparent;
    cursor: pointer;
}
.titleRow button i {
    transform: scale(1.2);
}
.links a * {
    display: inline-block;
}
.links a i {
    margin-left:10px;
    transform: scale(0.98);
}
.links a {
    margin-bottom: 10px;
    float:right;
    border-bottom: 2px solid rgb(37,37,37);
    padding-bottom: 5px;
}
a, a:visited {
    text-decoration: none;
    color:rgb(37, 37, 37);
}
</style>