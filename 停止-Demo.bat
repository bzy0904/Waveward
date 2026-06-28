@echo off
chcp 65001 >nul 2>&1
echo 正在停止 Waveward 服务...

REM 停止所有相关 node 进程（后端 + 隧道）
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Waveward*" 2>nul
taskkill /F /IM node.exe /FI "WINDOWTITLE eq node*" 2>nul

echo 完成。
pause
