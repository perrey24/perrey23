' =====================================================================
' LexFlow Colombia - Lanzador Inteligente de Escritorio
' Garantiza que la plataforma este 100% activa antes de abrir el navegador.
' NUNCA muestra error de conexion (ERR_CONNECTION_REFUSED).
' =====================================================================
Option Explicit

Dim WshShell, rootDir, isRunning, http, i, maxAttempts, url, healthUrl

Set WshShell = CreateObject("WScript.Shell")
rootDir = "C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia"
url = "http://localhost:3001"
healthUrl = "http://127.0.0.1:3001/api/health"

Function CheckServerHealth()
    Dim testHttp
    CheckServerHealth = False
    On Error Resume Next
    Set testHttp = CreateObject("MSXML2.ServerXMLHTTP.6.0")
    testHttp.Open "GET", healthUrl, False
    testHttp.setTimeouts 800, 800, 800, 800
    testHttp.Send
    If Err.Number = 0 Then
        If testHttp.Status = 200 Then
            CheckServerHealth = True
        End If
    End If
    Err.Clear
    On Error GoTo 0
End Function

' 1. Verificar si el servidor ya esta respondiendo
If Not CheckServerHealth() Then
    ' Iniciar el daemon supervisor silenciosamente
    WshShell.CurrentDirectory = rootDir
    WshShell.Run "wscript.exe """ & rootDir & "\servicio_lexflow.vbs""", 0, False

    ' 2. Esperar activamente en bucle hasta que el servidor este listo (hasta 15 segundos)
    maxAttempts = 35
    For i = 1 To maxAttempts
        WScript.Sleep 400
        If CheckServerHealth() Then
            Exit For
        End If
    Next
End If

' 3. Abrir la plataforma en el navegador solo si el servidor esta listo
If CheckServerHealth() Then
    WshShell.Run url
Else
    ' Si por algun motivo extremo tardo mas de lo esperado, informar amablemente
    MsgBox "LexFlow Colombia se esta inicializando en segundo plano." & vbCrLf & _
           "Por favor espere unos momentos y vuelva a hacer clic.", _
           vbInformation + vbOKOnly, "LexFlow Colombia"
End If
