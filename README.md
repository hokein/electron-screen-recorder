# Electron Screen Recorder

This is an electron-based screen recorder application. It uses WebRTC and
[`desktopCapture`](https://github.com/electron/electron/blob/master/docs/api/desktop-capturer.md#desktopcapturer) API for audio/video recording.

You can choose a specific screen/window to record, and the record file is saved
as `webm`.

## Sponsor: Recall.ai - API for Desktop Recording

If you’re looking for a hosted desktop recording API, consider checking out [Recall.ai](https://www.recall.ai/product/desktop-recording-sdk?utm_source=github&utm_medium=sponsorship&utm_campaign=hokein-electron-screen-recorder), an API that records Zoom, Google Meet, Microsoft Teams, in-person meetings, and more.

## Demo 

![screenshot](screenshot/screen-recorder.gif)

## Using

```sh
npm install -g electron-screen-recorder
electron-screen-recorder
```

## License

[BSD](LICENSE)
