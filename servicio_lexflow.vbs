' =====================================================================
' LexFlow Colombia - Servicio Silencioso de Fondo
' Ejecuta el Supervisor Daemon de forma 100% oculta en segundo plano
' =====================================================================
Set WshShell = CreateObject("WScript.Shell")
rootDir = "C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia"

WshShell.CurrentDirectory = rootDir
WshShell.Run "C:\PROGRA~1\nodejs\node.exe daemon.js", 0, False
