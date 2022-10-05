<!--

 * Path: '/client/src/components/EditProject.vue'
 * Author: Samis Moser
 * Desc: Component to edit project information

-->
<template>
    <div class="editProjectWrapper" @click="toggleContent()">
        <div class="editProject">
            <h2>Projekt editieren</h2>
            <div class="titleRow"></div>
            <div class="firstRow">
                <div class="textInputs">
                    <input :value="data.dataBefore.title" type="text" id="title" placeholder="*Projekttitel..">
                    <input :value="data.dataBefore.client" type="text" id="client" placeholder="*Auftraggeber">
                    <textarea :value="data.dataBefore.desc" name="" id="desc" cols="30" rows="6" placeholder="*Beschreibung"></textarea>
                </div>
                <div class="dateInputs">
                    <div>
                        <label>*Startdatum: </label>
                        <input :value="data.dataBefore.start" type="date" id="start">
                    </div>
                    <div>
                        <label>*Enddatum: </label>
                        <input :value="data.dataBefore.end" type="date" id="end">
                    </div>
                </div>
            </div>
            <div class="secondRow">
                <div class="choiceInputs">
                    <div>
                        <label>*Technologien: </label>
                        <div class="technologies">
                            <div v-for="technology in data.dataBefore.technologies" v-bind:key="technology.ID">
                                <p>{{technology.title}}</p>
                                <i class="gg-trash" @click="removeTechnology(technology.ID)"></i>
                            </div>
                            <button v-if="!data.visible.technologyDialog" @click="toggleTechnologyDialog(true)">+</button>
                            <button v-if="data.visible.technologyDialog" @click="toggleTechnologyDialog(false)">-</button>
                        </div>
                        <TechnologyDialog v-if="data.visible.technologyDialog" @technologyAdded="addTechnology($event)" />
                    </div>
                    <div>
                        <label>Teilnehmer: </label>
                        <div class="contributors">
                            <div v-for="contributor in data.dataBefore.contributors" v-bind:key="contributor.ID">
                                <p>{{contributor}}</p>
                                <i class="gg-trash" @click="removeContributor(contributor.ID)"></i>
                            </div>
                            <button v-if="!data.visible.contributorDialog"  @click="toggleContributorDialog(true)">+</button>
                            <button v-if="data.visible.contributorDialog" @click="toggleContributorDialog(false)">-</button>
                        </div>
                        <ContributorDialog v-if="data.visible.contributorDialog" @contributorAdded="addContributor($event)" />
                    </div>
                    <div>
                        <label>*Geschätzter Aufwand (Std): </label>
                        <input :value="data.dataBefore.timeExpected" type="number" id="timeExpected">
                    </div>
                    <div>
                        <label>Status: </label>
                        <select id="status">
                            <option value="-">-</option>
                            <option value="planned">planned</option>
                            <option value="active">active</option>
                            <option value="done">done</option>
                        </select>
                    </div>
                </div>
                <div class="linkInputs">
                    <input :value="data.dataBefore.gitlab" id="gitlab" type="text" placeholder="GitLab-URL">
                    <input :value="data.dataBefore.trello" id="trello" type="text" placeholder="Trello-URL">
                </div>
            </div>

            
            
            <div class="footer">
                <p>* = Pflichtfeld</p>
                <div class="buttons">
                    
                    <button class="submit" type="button" @click="submitProject()">Änderungen übernehmen</button>
                    <button class="delete" type="button" @click="deleteProject()">Projekt löschen</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
// imports
import { reactive } from 'vue'

// import config-file
import config from "../config.json"

// impoprt used local components
import TechnologyDialog from "./TechnologyDialog.vue"
import ContributorDialog from "./ContributorDialog.vue"

export default {
    components: {
        TechnologyDialog,
        ContributorDialog
    },
    props: {
        projectID: String
    },
    setup(props, context) {
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
        // set reactive data object to manipulate the DOM
        const data = reactive({
            visible: {
                technologyDialog:false,
                contributorDialog:false
            },
            projectData: {
                technologies: [],
                contributors:[]
            },
            dataBefore: {
            }
        })

        // error function (sends JavaScript-alert with specific message)
        const error = (message) => {
            alert("Fehler, "+message)
        }

        // function to fetch all technologies from DB
        const fetchTechnologies = () => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                }
            }
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/technologies/getByProjectID?pid=${props.projectID}`
            return new Promise(async resolve => {
                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()
                if(result.status) {
                    let techs = []
                    result.data.forEach(tech => {
                        techs.push(tech[0])
                    })
                    resolve(techs)

                }
                else {
                    resolve(false)
                }
            })
        }

        // function to delete project
        const deleteProject = async () => {
            let confirm = window.confirm("Wollen Sie das Projekt wirklich löschen?")
            if(confirm) {
                let fetchOptions = {
                    "method": "DELETE",
                    "headers": {
                        "Content-Type": "application/json",
                        "authorization": localStorage.jwt
                    },
                    "body": JSON.stringify({
                        pid: parseInt(props.projectID)
                    })
                }
                // api-call [ DELETE '/api/projects/remove' ]
                // request-body: pid - ID of project to remove
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/remove`

                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()

                if(result.status) {
                    context.emit("projectDeleted")
                }
                else {
                    error(result.message)
                }
            }
        }

        // function to get projectData to fill the values into
        // reactive variable / DOM
        const fetchValues = async () => {
            let fetchOptions = {
                "method": "GET",
                "headers": {
                    "Content-Type": "application/json",
                    "authorization": localStorage.jwt
                }
            }
            let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/getProject?pid=${props.projectID}`

            let response = await fetch(api_url, fetchOptions)
            let result = await response.json()

            result.data.start = convertDate(result.data.start)
            result.data.end = convertDate(result.data.end)

            if(result.data.contributors !== null) {
                 result.data.contributors = result.data.contributors.split(",")
            }
            

            let tech = await fetchTechnologies()
            result.data.technologies = tech

            data.dataBefore = result.data
            
        }

        // function to decode JWT-Payload ( used to get information about
        // the user logged in )
        const decodeTokenPayload = (token) => {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }
        
        // remove technology from reactive technologies array
        const removeTechnology = (id) => {
            let result = []
            data.dataBefore.technologies.forEach(technology => {
                if(technology.ID != id) {
                    result.push(technology)
                }
            })
            data.dataBefore.technologies = result
        }

        // remove contributor from reactive contributors array
        const removeContributor = (id) => {
            let result = []
            data.dataBefore.contributors.forEach(contributor => {
                if(contributor.ID != id) {
                    result.push(contributor)
                }
            })
            data.dataBefore.contributors = result
        }

        // toggle technology dialog 
        // mode = TRUE (dialog enabled), FALSE (dialog disabled)
        const toggleTechnologyDialog = (mode) => {
            data.visible.technologyDialog = mode
        }

        // add technology to reactive technologies array
        const addTechnology = (e) => {
            let found = false
            data.dataBefore.technologies.forEach(technology => {
                if(technology.title == e.title) {
                    found=true
                }
            })
            if(!found) {
                data.dataBefore.technologies.push(e)
                toggleTechnologyDialog(false)
            }
        }

        // add contributor to reactive contributors array
        const addContributor = (e) => {
            let found = false
            data.dataBefore.contributors.forEach(contributor => {
                if(contributor == e) {
                    found=true
                }
            })
            if(!found) {
                data.dataBefore.contributors.push(e)
                toggleContributorDialog(false)
            }
        }

        // toggle contributor dialog 
        // mode = TRUE (dialog enabled), FALSE (dialog disabled)
        const toggleContributorDialog = (mode) => {
            data.visible.contributorDialog = mode
        }

        const toggleContent = () => {
            if(event.target.classList[0] == "editProjectWrapper") {
                context.emit("editClosed")
            }
        }

        // validate if end-Date is bigger than start-Date
        const validateDates = (start, end) => {
            if(start > end) {
                return false
            }
            else {
                return true
            }
        }

        // validate required inputs
        const validateRequired = () => {
            let obj = {
                title: document.getElementById("title").value,
                client: document.getElementById("client").value,
                desc: document.getElementById("desc").value,
                start: document.getElementById("start").value,
                end: document.getElementById("end").value,
                timeExpected: document.getElementById("timeExpected").value,
                technologies: data.dataBefore.technologies.length
            }
            return obj.title != "" && obj.client != "" && obj.desc != "" && obj.start != "" && obj.end != "" && obj.technologies > 0 && obj.timeExpected 
        }

        // validate URL's ( gitlab, trello )
        // returns TRUE if URL contains 'http://' or 'https://'
        const validateUrl = (url) => {
            if(url.includes("http://") || url.includes("https://")) {
                return true
            }
            else {
                return false
            }
        }

        // submit changes to project (validate inputs and send update 
        // request to DB)
        const submitProject = async () => {
            let valid = false
            let requiredCheck =  validateRequired()
            if(!requiredCheck) {
                error("Bitte füllen Sie alle Pflichtfelder aus")
            }

            // convert dates to UNIX-timestamp

            let start = new Date(document.getElementById("start").value).getTime()
            let end = new Date(document.getElementById("end").value).getTime()

            let dateCheck = validateDates(start, end)

            if(!dateCheck) {
                error("Das Startdatum des Projekts darf nicht grösser sein, als das Enddatum")
            }
            else {
                if(document.getElementById("gitlab").value != "") {
                    if(!validateUrl(document.getElementById("gitlab").value)) {
                        error("[gitlab] Bitte geben Sie eine valide URL an")
                    }
                    else {
                        valid = true
                    }
                }
                else {
                    valid = true
                }
                if(document.getElementById("gitlab").value != "") {
                    if(!validateUrl(document.getElementById("gitlab").value)) {
                        error("[trello] Bitte geben Sie eine valide URL an")
                    }
                    else {
                        valid = true
                    }
                }
                else {
                    valid = true
                }
                
            }

            // check if validation was successful
            if(valid) {
                let fetchOptions = {
                    "method": "PUT",
                    "headers": {
                        "Content-Type": "application/json",
                        "authorization": localStorage.jwt
                    },
                    "body": JSON.stringify({
                        inputs: {
                            title: document.getElementById("title").value,
                            client: document.getElementById("client").value,
                            desc: document.getElementById("desc").value,
                            start: start,
                            end: end,
                            timeExpected: parseInt(document.getElementById("timeExpected").value),
                            contributors: data.dataBefore.contributors,
                            technologies: data.dataBefore.technologies,
                            gitlab: document.getElementById("gitlab").value,
                            trello: document.getElementById("trello").value,
                            status: document.getElementById("status")[document.getElementById("status").selectedIndex].value,
                            owner: decodeTokenPayload(localStorage.jwt).uid
                        },
                        projectID: parseInt(props.projectID)
                    })
                }
                // api-call [ PUT '/api/projects/edit' ]
                // request-body: inputs ( updated projectData ), 
                // projectID: ID of project to edit
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/edit`

                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()
                console.log(result)
                if(!result.status) {
                    error(result.message)
                }
                // emit event 'projectEdited' if edit was successfull
                context.emit("projectEdited")
                document.getElementsByClassName("editProjectWrapper")[0].click()
            }
            

        }

        // fetch current project values on page setup
        fetchValues()

        return { submitProject, deleteProject, toggleContent, data, removeTechnology, removeContributor, addTechnology, toggleTechnologyDialog, toggleContributorDialog, addContributor }
    }
}
</script>

<style scoped>
* {
    font-size: 12pt;;
}
h2 {
    font-size: 18pt;
    margin-bottom: 10px;
}
.editProjectWrapper {
    position: absolute;
    top:0;
    left:0;
    width:100%;
    height:100vh;
    margin:0;
    background-color:rgba(0, 0, 0,0.6);
    text-align: center;
}
.editProject {
    position: relative;
    width: 800px;
    height: 700px;
    background-color:rgba(255, 255, 255,1);
    margin-top: 5%;
    text-align: left;
    padding: 40px;
    border-radius: 7px;
    box-shadow: 1px 1px 3px rgba(0,0,0,0.5);
}
.firstRow, .secondRow, .footer {
    display: block;
    width:100%;
}
textarea {
    resize: none;
}
.footer p {
    left:30px;
}
.footer button {
    right:30px;
    float:right;
    border:0;
    border-radius: 15px;
    background:#00aaed;
    padding:10px;
    box-shadow: 1px 1px 3px #b8b8b8;
    font-weight: bold;
    color:#fff;
    cursor:pointer;
}
.footer button:hover {
    box-shadow: 2px 2px 5px #b8b8b8;
    transform: scale(1.05);
}
.content div {
    display: inline-block;
}
.textInputs input, .textInputs textarea {
    display: block;
    width: 300px;
}

.linkInputs input {
    display: block;
    width: 200px;
    height: 20px;
    margin-bottom: 5px;
}
input[type="text"] {
    height: 20px;
    margin-bottom: 5px;
    padding: 5px;
}
textarea {
    margin-bottom: 5px;
    padding: 5px;
}
.dateInputs div {
    display: block;
}
.dateInputs, .linkInputs {
    float:right;
    margin-right: 30px;
    text-align: right;
}
.choiceInputs label {
    font-weight: bold;
}
.choiceInputs div {
    display: block;
    margin-bottom: 10px;
}
.technologies, .contributors {
    width: 600px;
    display: block;
}
.technologies button, .technologies label, .contributors button, .contributors label {
    display: inline-block;
}
.technologies div, .contributors div {
    display: inline-block;
    background: #00aaed;
    margin: 10px;
    max-width: 150px;
    height: 30px;
    border-radius: 30px;
    text-align: center;
    vertical-align: center;
    line-height: 11px;
    padding:5px;
}
.technologies div *, .contributors div * {
    display: inline-flex;
    margin-left: 5px;
    margin-right: 5px;
}
.technologies div p, .contributors div p {
    font-weight: bold;
    color:#fff;
    font-size: 15px;
}
.technologies div i, .contributors div i {
    color:#fff;
    height: 11px;
    width:11px;
    cursor: pointer;
}
.technologies button, .contributors button {
    width: 30px;
    height:30px;
    border-radius:100%;
    border:none;
    background-color:#00aaed;
    color:#fff;
    font-weight: bold;
    font-size: 15pt;
    cursor:pointer;
}

.technologies button, .contributors button, .technologies div, .contributors div {
    box-shadow: 1px 1px 2px #b8b8b8;
}

.technologies button:hover, .contributors button:hover {
    transform: scale(1.05);
} 
.footer {
    bottom: 30%;

}
.footer * {
    display: inline-block;
    width: 50%;
}
.footer .buttons {
    position: absolute;
    bottom: 30px;
    right:30px;
    width:100%;
}
.buttons button {
    display: inline-block;
    max-width: 250px;
    margin: 5px;
}
.footer p {
    position: absolute;
    left:30px;
    bottom:30px;
}
.footer .buttons .delete {
    background-color:rgb(224, 64, 99);
}
input[type="number"] {
    max-width: 50px;
}
label {
    font-weight: bold;
}
</style>