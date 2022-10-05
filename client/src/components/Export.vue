<!--

 * Path: '/client/src/components/Export.vue'
 * Author: Samis Moser
 * Desc: Component to export Data to JSON and CSV

-->
<template>
  <div>
    <button class="json" @click="exportData('json')">JSON</button>
    <button class="csv" @click="exportData('csv')">CSV</button>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    filename : String
  },
  setup(props) {
    // function to export Data either in JSON or CSV-format
    function exportData(format) {
      let name = (props.filename) ? props.filename : 'export'
      let file = {
        name : `${name}.${format}`,
        content : null,
        contentType : null
      }
      if (format === 'json') {
        file.contentType = 'application/json'
        file.content = JSON.stringify(props.data)

      } else if (format === 'csv') {
        file.contentType = 'application/csv'
        file.content = Object.keys(props.data[0]).join() + '\r\n'
        props.data.forEach(line => {
          file.content+= Object.values(line).join() + '\r\n'
        })
      }
      // create Blob with file content + contentType
      const blob = new Blob([file.content], { type: file.contentType })
      const link = document.createElement('a')
      // create download URL for Blob
      link.href = URL.createObjectURL(blob)
      link.download = file.name
      // click download link
      link.click()
      // revoke download URl after download
      URL.revokeObjectURL(link.href)
    }

    return {
      exportData
    }
  },
}
</script>

<style scoped>
button {
  border: 1px solid #b8b8b8;
  background: #fff;
  width: 50px;
  height: 35px;
  margin: 5px;
  border-radius: 7px;
  box-shadow: 1px 1px 3px #b8b8b8;
  font-weight: bold;
  cursor:pointer;
}
button:hover {
  transform: scale(1.05);
}
.json {
  color:rgb(175, 50, 206);
}
.csv {
  color:rgb(29, 223, 103);
}
</style>