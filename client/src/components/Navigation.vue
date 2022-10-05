<!--

 * Path: '/client/src/components/Navigation.vue'
 * Author: Samis Moser
 * Desc: Navigation component (Navbar)

-->
<template>
    <div class="bar">
        <ul>
            <li @click="changePage(0)">Meine Projekte</li>
            <li @click="changePage(1)">Projektübersicht</li>
            <li v-if="data.status == 'Lernender'"></li>
            <li v-if="data.status == 'Lehrperson'" @click="changePage(2)">Technologien</li>
            <li @click="changePage(3)" class="right"><img src="../assets/user.png" alt=""></li>
        </ul>
    </div>
</template>

<script>
// imports
import { reactive } from "vue"

export default {
    setup(props, context) {
        // set up reactive variable to manipulate DOM
        const data = reactive({activePage:0,status:""})

        // array of list elements in navigation
        let elems = document.getElementsByTagName("li")

        setTimeout(() => {
            // set first element to 'active' by default 
            // ( My-Projects-Page as startpage )
            elems[0].classList.add("active")
        },100)
        
        // function to decode JWT-Payload ( used to get information about
        // the user logged in )
        const decodeTokenPayload = (token) => {
            let payload = token.replace(/-/g, '+').replace(/_/g, '/').split('.')[1]
            payload = JSON.parse(Buffer.from(payload, 'base64').toString())
            return payload
        }

        
        // function to change current active page to page with ID 
        // of function parameter ( pageID )
        const changePage = (pageID) => {
            elems.forEach((elem, index) => {
                if(index != pageID) {
                    elem.classList.remove("active")
                }
                else {
                    elem.classList.add("active")
                    data.activePage = index
                    context.emit("pageChanged", index)
                }
            })
        }

        // set data.status to perm ( JWT )
        // so the "Technologies"-Tab will only show up if a user
        // with perm "Lehrperson" is logged in
        data.status = decodeTokenPayload(localStorage.jwt).perm

        return { data, changePage }
    }
}
</script>

<style scoped>
ul {
    display: flex;
    background: #00AAED;
    box-shadow: 1px 1px 5px rgb(139, 139, 139);
}
.right {
    margin-left: auto;
    
}
.right.active {
    border:0;
}
li {
    text-align: center;
    display: inline-block;
    margin: 30px;
    padding:0;
    font-size: 15pt;
    cursor: pointer;
    color:#fff;
    font-weight: bold;
}
.active {
    text-decoration: underline;
}
.right img {
    position: relative;
    width: 50px;
    filter: invert(1);
}
</style>