const hashCode = function(word) {
  var hash = 0,
    i,
    chr
  if (word.length === 0) return hash
  for (i = 0; i < word.length; i++) {
    chr = word.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

var config = {
  apiKey: 'AIzaSyAXRiEgsWNrmRfPQ8KbXY-0PnZjsAm4INI',
  authDomain: 'fy-moodle.firebaseapp.com',
  databaseURL: 'https://fy-moodle.firebaseio.com',
  projectId: 'fy-moodle',
  storageBucket: 'fy-moodle.appspot.com',
  messagingSenderId: '944849265962'
}
firebase.initializeApp(config)

const classes = Array.prototype.slice.call(
  document.getElementsByClassName('type_course')
)
classes.forEach(e => {
  let a = e.childNodes[0].childNodes[0]
  const link = a.href
  const splitName = a.title.split(' ')
  const name = splitName[0] + splitName[1]
  if (name[0] === 'F') {
    // console.log(name,link)
    const gradesLink = link.replace('course/view', 'grade/report/user/index')
    // console.log(gradesLink)
    axios.get(gradesLink).then(page => {
      var fragment = new DocumentFragment()
      var html = document.createElement('html')
      fragment.appendChild(html)
      fragment.childNodes[0].innerHTML = page.data
      Array.prototype.slice
        .call(fragment.childNodes[0].getElementsByClassName('gradeitemheader'))
        .forEach(grade => {
          if (
            (grade.innerHTML.toLowerCase().includes('teste') ||
              grade.innerHTML.toLowerCase().includes('questionário') ||
              grade.innerHTML.toLowerCase().includes('atividade') ||
              grade.innerHTML.toLowerCase().includes('pré-aula')) &&
            !grade.innerHTML.toLowerCase().includes('prova') &&
            grade.nodeName === 'A'
          ) {
            axios.get(grade.href).then(revisionPage => {
              fragment.childNodes[0].innerHTML = revisionPage.data
              // if (fragment.childNodes[0].getElementsByClassName("lastrow"))
              if (
                fragment.childNodes[0].getElementsByClassName('lastcol')[0] ===
                undefined
              ) {
                console.log('Teste não feito:', grade.href)
              } else {
                Array.prototype.slice
                  .call(
                    fragment.childNodes[0].getElementsByClassName('lastcol')
                  )
                  .forEach(col => {
                    if (col.nodeName === 'TD') {
                      // console.log(col)
                      if (col.childNodes[0] !== undefined) {
                        var testeLink = col.childNodes[0].href
                        if (testeLink === undefined) {
                          console.log('Deu merda:', grade.href)
                        } else {
                          // console.log(testeLink)
                          axios.get(testeLink).then(testePage => {
                            fragment.childNodes[0].innerHTML = testePage.data
                            console.log(name, testePage)

                            Array.prototype.slice
                              .call(
                                fragment.childNodes[0].getElementsByClassName(
                                  'questioncorrectnessicon'
                                )
                              )
                              .filter(e => {
                                return e.src.indexOf('incorrect') === -1
                              })
                              .map(e => {
                                let answer = Array.prototype.slice
                                  .call(e.parentNode.childNodes)
                                  .filter(e => {
                                    return (
                                      e.nodeName === 'LABEL' ||
                                      e.nodeName === 'SPAN'
                                    )
                                  })
                                  .map(e => {
                                    if (e.nodeName === 'INPUT') {
                                      return e.value
                                    } else {
                                      return e.innerHTML
                                    }
                                  })[0]

                                if (!typeof answer === 'string') {
                                  answer = new XMLSerializer().serializeToString(
                                    answer
                                  )
                                }

                                let parent = e.parentNode

                                while (
                                  parent.className.indexOf('formulation') === -1
                                ) {
                                  parent = parent.parentNode
                                }

                                const question = Array.prototype.slice
                                  .call(parent.childNodes)
                                  .filter(e => {
                                    return e.nodeName === 'DIV'
                                  })
                                  .filter(div => {
                                    return div.className === 'qtext'
                                  })[0]

                                const db = firebase.database().ref(`${name}/`)

                                answer = answer.replace('.a ', '')
                                answer = answer.replace('.b ', '')
                                answer = answer.replace('.c ', '')
                                answer = answer.replace('.d ', '')
                                answer = answer.replace('.e ', '')
                                answer = answer.replace('.f ', '')

                                db
                                  .child(
                                    hashCode(
                                      new XMLSerializer().serializeToString(
                                        question
                                      )
                                    )
                                  )
                                  .set({
                                    answer: answer
                                  })
                              })

                            Array.prototype.slice
                              .call(
                                fragment.childNodes[0].getElementsByClassName(
                                  'questioncorrectnessicon'
                                )
                              )
                              .filter(e => {
                                return e.src.indexOf('incorrect') !== -1
                              })
                              .map(e => {
                                let answer = Array.prototype.slice
                                  .call(e.parentNode.childNodes)
                                  .filter(e => {
                                    return (
                                      e.nodeName === 'LABEL' ||
                                      e.nodeName === 'SPAN'
                                    )
                                  })
                                  .map(e => {
                                    if (e.nodeName === 'INPUT') {
                                      return e.value
                                    } else {
                                      return e.innerHTML
                                    }
                                  })[0]

                                if (!typeof answer === 'string') {
                                  answer = new XMLSerializer().serializeToString(
                                    answer
                                  )
                                }

                                let parent = e.parentNode

                                while (
                                  parent.className.indexOf('formulation') === -1
                                ) {
                                  parent = parent.parentNode
                                }

                                const question = Array.prototype.slice
                                  .call(parent.childNodes)
                                  .filter(e => {
                                    return e.nodeName === 'DIV'
                                  })
                                  .filter(div => {
                                    return div.className === 'qtext'
                                  })[0]

                                const questionHash = hashCode(
                                  new XMLSerializer().serializeToString(
                                    question
                                  )
                                )

                                const db = firebase
                                  .database()
                                  .ref(`${name}/${questionHash}/incorrect`)

                                answer = answer.replace('.a ', '')
                                answer = answer.replace('.b ', '')
                                answer = answer.replace('.c ', '')
                                answer = answer.replace('.d ', '')
                                answer = answer.replace('.e ', '')
                                answer = answer.replace('.f ', '')

                                db.child(hashCode(answer)).set({
                                  answer: answer
                                })
                              })
                          })
                        }
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
