@echo off
start python server.py
chrome --disable-session-crashed-bubble --no-first-run "http://127.0.0.1:8080/index.html?startPlayback=test-run-2"
