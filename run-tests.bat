@echo off
start python server.py
chrome --new-instance --user-data-dir=./test-chrome-profile --disable-session-crashed-bubble --no-first-run "http://127.0.0.1:8080/index.html?startPlayback=test-run-2"
rmdir /s /q test-chrome-profile >nul 2>&1
