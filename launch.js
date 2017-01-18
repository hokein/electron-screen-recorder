#!/usr/bin/env node

const electron = require('electron')
const proc = require('child_process')

// launch Electron
var child = proc.spawn(electron, [__dirname])
