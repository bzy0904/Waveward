@echo off
chcp 65001 >nul 2>&1
set PATH=%~dp0.tools\node;%PATH%

echo ============================================
echo   涉浪鉴定  本地启动 + 公网穿透
echo ============================================
echo.

REM 启动后端服务
echo [1/2] 启动后端服务...
start "Waveward-Backend" /min cmd /c "node api\server.js"

REM 等待后端启动
timeout /t 3 /nobreak >nul

REM 启动 localtunnel
echo [2/2] 启动 localtunnel 穿透...
start "Waveward-Tunnel" /min cmd /c "node node_modules\localtunnel\bin\lt.js --port 3001 --print-requests"

timeout /t 5 /nobreak >nul

echo.
echo ============================================
echo   网站已上线！
echo   本地地址: http://localhost:3001
echo   公网地址: 查看 .tools\tunnel.log 文件
echo ============================================
echo.
echo   关闭本窗口不会停止服务；如需停止，请运行 stop.bat
echo.

type .tools\tunnel.log 2>nul | findstr "your url is"
echo.
pause
