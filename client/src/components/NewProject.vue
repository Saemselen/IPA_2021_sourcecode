<!--

 * Path: '/client/src/components/NewProject.vue'
 * Author: Samis Moser
 * Desc: Dialogue to create a new Project

-->
<template>
    <div class="newProjectWrapper" @click="toggleContent()">
        <div class="newProject">
            <h2>Neues Projekt</h2>
            <div class="titleRow"></div>
            <div class="firstRow">
                <div class="textInputs">
                    <input type="text" id="title" placeholder="*Projekttitel..">
                    <input type="text" id="client" placeholder="*Auftraggeber">
                    <textarea name="" id="desc" cols="30" rows="6" placeholder="*Beschreibung"></textarea>
                </div>
                <div class="dateInputs">
                    <div>
                        <label>*Startdatum: </label>
                        <input type="date" id="start">
                    </div>
                    <div>
                        <label>*Enddatum: </label>
                        <input type="date" id="end">
                    </div>
                </div>
            </div>
            <div class="secondRow">
                <div class="choiceInputs">
                    <div>
                        <label>*Technologien: </label>
                        <div class="technologies">
                            <div v-for="technology in data.projectData.technologies" v-bind:key="technology.ID">
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
                            <div v-for="contributor in data.projectData.contributors" v-bind:key="contributor.ID">
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
                        <input type="number" id="timeExpected">
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
                    <input id="gitlab" type="text" placeholder="GitLab-URL">
                    <input id="trello" type="text" placeholder="Trello-URL">
                </div>
            </div>

            
            
            <div class="footer">
                <p>* = Pflichtfeld</p>
                <button type="button" @click="submitProject()">Projekt erstellen</button>
            </div>
        </div>
    </div>
</template>

<script>
// imports
import { reactive } from 'vue'

// import config-file
import config from "../config.json"

// import local used components
import TechnologyDialog from "./TechnologyDialog.vue"
import ContributorDialog from "./ContributorDialog.vue"

export default {
    components: {
        TechnologyDialog,
        ContributorDialog
    },
    setup(props, context) {
        // set up reactive variable to manipulate DOM & to collect user inputs
        const data = reactive({
            visible: {
                technologyDialog:false,
                contributorDialog:false
            },
            projectData: {
                technologies: [],
                contributors:[]
            }
        })

        // error function (sends JavaScript-alert with specific message)
        const error = (message) => {
            alert("Fehler, "+message)
        }

        // function to decode JWT-Payload ( used to get information about
        // the user logged in )
        const decodeTokenPayload = (token) => {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }
        
        // function to remove entry from data.projectData.technologies-Array
        const removeTechnology = (id) => {
            let result = []
            data.projectData.technologies.forEach(technology => {
                if(technology.ID != id) {
                    result.push(technology)
                }
            })
            data.projectData.technologies = result
        }

        // function to remove entry from data.projectData.contributors-Array
        const removeContributor = (id) => {
            let result = []
            data.projectData.contributors.forEach(contributor => {
                if(contributor.ID != id) {
                    result.push(contributor)
                }
            })
            data.projectData.contributors = result
        }

        // function to show/hide technology dialogue component
        const toggleTechnologyDialog = (mode) => {
            data.visible.technologyDialog = mode
        }

        // function to show/hide contributors dialogue component
        const toggleContributorDialog = (mode) => {
            data.visible.contributorDialog = mode
        }

        // function to add entry to data.projectData.technologies-Array
        const addTechnology = (e) => {
            let found = false
            data.projectData.technologies.forEach(technology => {
                if(technology.title == e.title) {
                    found=true
                }
            })
            if(!found) {
                data.projectData.technologies.push(e)
                toggleTechnologyDialog(false)
            }
        }

        // function to add entry to data.projectData.contributors-Array
        const addContributor = (e) => {
            let found = false
            data.projectData.contributors.forEach(contributor => {
                if(contributor == e) {
                    found=true
                }
            })
            if(!found) {
                data.projectData.contributors.push(e)
                toggleContributorDialog(false)
            }
        }

        // function to hide new-project-component
        const toggleContent = () => {
            if(event.target.classList[0] == "newProjectWrapper") {
                context.emit("newProjectClosed")
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
                technologies: data.projectData.technologies.length
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
                    "method": "POST",
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
                            contributors: data.projectData.contributors.join(","),
                            technologies: data.projectData.technologies,
                            gitlab: document.getElementById("gitlab").value,
                            trello: document.getElementById("trello").value,
                            status: document.getElementById("status")[document.getElementById("status").selectedIndex].value,
                            owner: decodeTokenPayload(localStorage.jwt).uid
                        }
                    })
                }
                // api-call [ POST '/api/projects/new' ]
                // request-body: 
                // - inputs ( updated projectData )
                let api_url = `${config.connections.backend.host}:${config.connections.backend.port}/api/projects/new`

                let response = await fetch(api_url, fetchOptions)
                let result = await response.json()
                console.log(result)
                if(!result.status) {
                    error(result.message)
                }
                // emit event 'newProjectCreated' if adding the project 
                // was successfull
                context.emit("newProjectCreated")
                document.getElementsByClassName("newProjectWrapper")[0].click()
            }
            

        }

        return { submitProject, toggleContent, data, removeTechnology, removeContributor, addTechnology, toggleTechnologyDialog, toggleContributorDialog, addContributor }
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
.newProjectWrapper {
    position: absolute;
    top:0;
    left:0;
    width:100%;
    height:100vh;
    margin:0;
    background-color:rgba(0, 0, 0,0.6);
    text-align: center;
}
.newProject {
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
.footer button {
    position: absolute;
    right:30px;
    bottom:30px;
    max-width: 200px;
}
.footer p {
    position: absolute;
    left:30px;
    bottom:30px;
}
input[type="number"] {
    max-width: 50px;
}
label {
    font-weight: bold;
}
</style>