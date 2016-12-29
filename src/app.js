const {desktopCapturer, ipcRenderer, remote} = require('electron')
const domify = require('domify')

let localStream
let microAudioStream
let recordedChunks = []
let numRecordedChunks = 0
let recorder
let includeMic = false
// let includeSysAudio = false

document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#record-desktop').addEventListener('click', recordDesktop)
  document.querySelector('#record-camera').addEventListener('click', recordCamera)
  document.querySelector('#record-window').addEventListener('click', recordWindow)
  document.querySelector('#play-video').addEventListener('click', playVideo)
  document.querySelector('#micro-audio').addEventListener('click', microAudioCheck)
  // document.querySelector('#system-audio').addEventListener('click', sysAudioCheck)
  document.querySelector('#record-stop').addEventListener('click', stopRecording)
  document.querySelector('#play-button').addEventListener('click', play)
  document.querySelector('#download-button').addEventListener('click', download)
})

const playVideo = () => {
  remote.dialog.showOpenDialog({properties: ['openFile']}, (filename) => {
    console.log(filename)
    let video = document.querySelector('video')
    video.muted = false
    video.src = filename
  })
}

const disableButtons = () => {
  document.querySelector('#record-desktop').disabled = true
  document.querySelector('#record-camera').disabled = true
  document.querySelector('#record-window').disabled = true
  document.querySelector('#record-stop').hidden = false
  document.querySelector('#play-button').hidden = true
  document.querySelector('#download-button').hidden = true
}

const enableButtons = () => {
  document.querySelector('#record-desktop').disabled = false
  document.querySelector('#record-camera').disabled = false
  document.querySelector('#record-window').disabled = false
  document.querySelector('#record-stop').hidden = true
  document.querySelector('#play-button').hidden = true
  document.querySelector('#download-button').hidden = true
}

const microAudioCheck = () => {
  // includeSysAudio = false
  // document.querySelector('#system-audio').checked = false

  // Mute video so we don't play loopback audio.
  var video = document.querySelector('video')
  video.muted = true
  includeMic = !includeMic
  console.log('Audio =', includeMic)

  if (includeMic) {
    navigator.webkitGetUserMedia({ audio: true, video: false },
        getMicroAudio, getUserMediaError)
  }
}

// function sysAudioCheck () {
  // // Mute video so we don't play loopback audio
  // var video = document.querySelector('video')
  // video.muted = true

  // includeSysAudio = !includeSysAudio
  // includeMic = false
  // document.querySelector('#micro-audio').checked = false
  // console.log('System Audio =', includeSysAudio)
// };

const cleanRecord = () => {
  recordedChunks = []
  numRecordedChunks = 0
}

ipcRenderer.on('source-id-selected', (event, sourceId) => {
  // Users have cancel the picker dialog.
  if (!sourceId) return
  console.log(sourceId)
  onAccessApproved(sourceId)
})

const recordDesktop = () => {
  cleanRecord()
  ipcRenderer.send('show-picker', { types: ['screen'] })
}

const recordWindow = () => {
  cleanRecord()
  ipcRenderer.send('show-picker', { types: ['window'] })
}

const recordCamera = () => {
  cleanRecord()
  navigator.webkitGetUserMedia({
    audio: false,
    video: { mandatory: { minWidth: 1280, minHeight: 720 } }
  }, gotMediaStream, getUserMediaError)
}

const recorderOnDataAvailable = (event) => {
  if (event.data && event.data.size > 0) {
    recordedChunks.push(event.data)
    numRecordedChunks += event.data.byteLength
  }
}

const stopRecording = () => {
  console.log('Stopping record and starting download')
  enableButtons()
  document.querySelector('#play-button').hidden = false
  document.querySelector('#download-button').hidden = false
  recorder.stop()
  localStream.getVideoTracks()[0].stop()
}

const play = () => {
  // Unmute video.
  let video = document.querySelector('video')
  video.muted = false
  let blob = new Blob(recordedChunks, {type: 'video/webm'})
  video.src = window.URL.createObjectURL(blob)
}

const download = () => {
  let blob = new Blob(data, {type: 'video/webm'})
  let url = URL.createObjectURL(blob)
  let a = document.createElement('a')
  document.body.appendChild(a)
  a.style = 'display: none'
  a.href = url
  a.download = name
  a.click()
  setTimeout(function () {
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, 100)
}

const getMediaStream = (stream) => {
  let video = document.querySelector('video')
  video.src = URL.createObjectURL(stream)
  localStream = stream
  stream.onended = () => { console.log('Media stream ended.') }

  let videoTracks = localStream.getVideoTracks()

  if (includeMic) {
    console.log('Adding audio track.')
    let audioTracks = microAudioStream.getAudioTracks()
    localStream.addTrack(audioTracks[0])
  }
  // if (includeSysAudio) {
    // console.log('Adding system audio track.')
    // let audioTracks = stream.getoAudioTracks()
    // if (audioTracks.length < 1) {
      // console.log('No audio track in screen stream.')
    // }
  // } else {
    // console.log('Not adding audio track.')
  // }
  try {
    console.log('Start recording the stream.')
    recorder = new MediaRecorder(stream)
  } catch (e) {
    console.assert(false, 'Exception while creating MediaRecorder: ' + e)
    return
  }
  recorder.ondataavailable = recorderOnDataAvailable
  recorder.onstop = () => { console.log('recorderOnStop fired') }
  recorder.start()
  console.log('Recorder is started.')
  disableButtons()
}

const getMicroAudio = (stream) => {
  console.log('Received audio stream.')
  microAudioStream = stream
  stream.onended = () => { console.log('Micro audio ended.') }
}

const getUserMediaError = () => {
  console.log('getUserMedia() failed.')
}

const onAccessApproved = (id) => {
  if (!id) {
    console.log('Access rejected.')
    return
  }
  console.log('Window ID: ', id)
  navigator.webkitGetUserMedia({
    audio: false,
    video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: id,
      maxWidth: 320, maxHeight: 180 } }
  }, getMediaStream, getUserMediaError)
}
