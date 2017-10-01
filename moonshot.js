const hashCode = function(word) {
    var hash = 0,
        i, chr;
    if (word.length === 0) return hash;
    for (i = 0; i < word.length; i++) {
        chr = word.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

// var config = {
//     apiKey: "AIzaSyAXRiEgsWNrmRfPQ8KbXY-0PnZjsAm4INI",
//     authDomain: "fy-moodle.firebaseapp.com",
//     databaseURL: "https://fy-moodle.firebaseio.com",
//     projectId: "fy-moodle",
//     storageBucket: "fy-moodle.appspot.com",
//     messagingSenderId: "944849265962"
// };
// firebase.initializeApp(config);
var config = {
    apiKey: "AIzaSyCfI1g-1KfhfTXVikM2hY7ochuT0W-0naI",
    authDomain: "fy-moodle-test-area.firebaseapp.com",
    databaseURL: "https://fy-moodle-test-area.firebaseio.com",
    projectId: "fy-moodle-test-area",
    storageBucket: "",
    messagingSenderId: "291524795540"
};
firebase.initializeApp(config);


const classes = Array.prototype.slice.call(document.getElementsByClassName("type_course"))
classes.forEach(e => {
  let a = e.childNodes[0].childNodes[0]
  const link = a.href
  const splitName = a.title.split(" ")
  const name = splitName[0] + splitName[1]
  if (name[0] === "F"){
    // console.log(name,link)
    const gradesLink = link.replace("course/view","grade/report/user/index")
    // console.log(gradesLink)
    axios.get(gradesLink).then(page => {
      var fragment = new DocumentFragment()
      var html = document.createElement("html")
      fragment.appendChild(html)
      fragment.childNodes[0].innerHTML = page.data
      Array.prototype.slice.call(fragment.childNodes[0].getElementsByClassName("gradeitemheader"))
      .forEach(grade => {
        if ((grade.innerHTML.toLowerCase().includes("teste") ||
            grade.innerHTML.toLowerCase().includes("questionário") ||
            grade.innerHTML.toLowerCase().includes("atividade")) &&
            !grade.innerHTML.toLowerCase().includes("prova") &&
            grade.nodeName === 'A') {
          axios.get(grade.href).then(revisionPage => {
            fragment.childNodes[0].innerHTML = revisionPage.data
            // if (fragment.childNodes[0].getElementsByClassName("lastrow"))
            if (fragment.childNodes[0].getElementsByClassName("lastcol")[0] === undefined){
              console.log("Teste não feito:",grade.href)
            } else {
              Array.prototype.slice.call(fragment.childNodes[0].getElementsByClassName("lastcol"))
              .forEach(col => {
                if (col.nodeName === "TD"){
                  // console.log(col)
                  if (col.childNodes[0] !== undefined) {
                    var testeLink = col.childNodes[0].href
                    if (testeLink === undefined)
                      console.log("Deu merda:",grade.href)
                    // console.log(testeLink)
                    axios.get(testeLink).then(testePage => {
                      fragment.childNodes[0].innerHTML = testePage.data
                      console.log(name,testePage)

                      Array.prototype.slice.call(fragment.childNodes[0].getElementsByClassName("questioncorrectnessicon"))
                          .filter(e => {
                          return e.src.indexOf("incorrect") === -1
                      })
                      .map(e => {
                          const answer =
                              Array.prototype.slice.call(e.parentNode.childNodes).filter(e => {
                                  return e.nodeName === "LABEL" || e.nodeName === "SPAN"
                              }).map(e => {
                          if (e.nodeName === "INPUT") {
                          return e.value
                      } else {
                          return e.innerHTML
                      }
                      })[0]

                      if (!typeof answer === "string") {
                          answer = new XMLSerializer().serializeToString(answer)
                      }

                      let parent = e.parentNode;

                      while (parent.className.indexOf("formulation") === -1) {
                          parent = parent.parentNode

                      }

                      const question = Array.prototype.slice.call(parent.childNodes).filter(e => {
                          return e.nodeName === "DIV"
                      }).filter(div => {
                          return div.className === "qtext"
                      })[0]

                      const db = firebase.database().ref(`${name}/`)

                      db.child(hashCode(new XMLSerializer().serializeToString(question))).set({
                          answer: answer
                      });
                      })

                      Array.prototype.slice.call(fragment.childNodes[0].getElementsByClassName("questioncorrectnessicon"))
                          .filter(e => {
                          return e.src.indexOf("incorrect") !== -1
                      })
                      .map(e => {
                          const answer =
                              Array.prototype.slice.call(e.parentNode.childNodes).filter(e => {
                                  return e.nodeName === "LABEL" || e.nodeName === "SPAN"
                              }).map(e => {
                          if (e.nodeName === "INPUT") {
                          return e.value
                      } else {
                          return e.innerHTML
                      }
                      })[0]

                      if (!typeof answer === "string") {
                          answer = new XMLSerializer().serializeToString(answer)
                      }

                      let parent = e.parentNode;

                      while (parent.className.indexOf("formulation") === -1) {
                          parent = parent.parentNode

                      }

                      const question = Array.prototype.slice.call(parent.childNodes).filter(e => {
                          return e.nodeName === "DIV"
                      }).filter(div => {
                          return div.className === "qtext"
                      })[0]

                      const questionHash = hashCode(new XMLSerializer().serializeToString(question))

                      const db = firebase.database().ref(`${name}/${questionHash}/incorrect`)
                      db.child(hashCode(answer)).set({
                          answer: answer
                      });
                      })
                    })
                  }
                }
              })
            }
          })
        }
      })
    })
  }
})

// var xmlHttp = new XMLHttpRequest();
// xmlHttp.onreadystatechange = function() {
//     if (xmlHttp.readyState == 4 && xmlHttp.status == 200){
//         console.log(xmlHttp)
//         var fragment = new DocumentFragment()
//         var body = document.createElement("body")
//         fragment.appendChild(body)
//         fragment.childNodes[0].innerHTML = xmlHttp.responseText
//         console.log(fragment)
//     }
// }
// xmlHttp.open("GET", gradesLink, true); // true for asynchronous
// // xmlHttp.withCredentials = true;
// xmlHttp.send(null);


// let menuItems = Array.prototype.slice.call(document.getElementsByClassName("item-content-wrap"))
//
// console.log(menuItems.filter(item => {
//   return item.innerHTML.charAt(0) === 'F';
// }).map(item => {
//   return {url: item.parentNode.href, name: item.innerHTML}
// }).map(item => {
//   const splitedName = item.name.split(' ')
//   const normName = splitedName[0] + splitedName[1]
//   return {...item,  name: normName}
// }).forEach(item => {
//   axios.get(item.url).then(page => {
//     const data = page.data
//     const reg = /http:\/\/www.ggte.unicamp.br\/eam\/grade\/report\/.*["]/
//     const match = reg.exec(data)
//     const url = match[0].split('"')[0]
//     axios.get(url).then(grades => {
//       const data = grades.data
//       const reg = /Capítulo.*/
//       const match = reg.exec(data)
//       const url = match[0].split('"')[0]
//       console.log(url)
//     })
//   })
// })
// )

// axios.get("http://www.ggte.unicamp.br/eam/mod/quiz/review.php?attempt=275502")