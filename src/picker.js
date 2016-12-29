
const {desktopCapturer, ipcRenderer} = require('electron')
const domify = require('domify');
document.onkeydown = function(evt) {
  evt = evt || window.event;
  if (evt.keyCode == 27) {
     ipcRenderer.send('source-id-selected', null)
  }
};

ipcRenderer.on('get-sources', (event) => {
  desktopCapturer.getSources({ types: ['window'] }, (error, sources) => {
    if (error) throw error
    var sourcesList = document.querySelector('.capturer-list')
    for (let source of sources) {
       var thumb = source.thumbnail.toDataURL()
       if (!thumb) return
       var title = source.name.slice(0, 20)
       var item = `<li><a href="#"><img src="${thumb}"><span>${title}</span></a></li>`
       sourcesList.appendChild(domify(item))
    }
    var links = sourcesList.querySelectorAll('a')
    for (var i = 0; i < links.length; i++) {
       let closure = (i) => {
         return (e) => {
           e.preventDefault();
           ipcRenderer.send('source-id-selected', sources[i].id)
           sourcesList.innerHTML = ""
         }
       }
       links[i].onclick = closure(i)
    }
  })
})
