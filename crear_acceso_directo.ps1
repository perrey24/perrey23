$desktopPath = [System.Environment]::GetFolderPath('Desktop')
$wsh = New-Object -ComObject WScript.Shell

$shortcutPath = Join-Path $desktopPath "LexFlow Colombia.lnk"
$shortcut = $wsh.CreateShortcut($shortcutPath)
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia\abrir_lexflow.vbs`""
$shortcut.WorkingDirectory = "C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia"
$shortcut.Description = "LexFlow Colombia - Plataforma Inteligente de Gestión Jurídica"
$shortcut.IconLocation = "C:\Windows\System32\imageres.dll,15"
$shortcut.Save()

Write-Output "Acceso directo creado con exito en: $shortcutPath"
