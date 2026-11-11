Set wsh = CreateObject("WScript.Shell")
desktop = wsh.SpecialFolders("Desktop")
Set s = wsh.CreateShortcut(desktop & "\LexFlow Colombia.lnk")
s.TargetPath = "wscript.exe"
s.Arguments = """C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia\abrir_lexflow.vbs"""
s.WorkingDirectory = "C:\Users\REINALDO\Desktop\05_Instaladores_y_Software\lexflow-colombia"
s.Description = "LexFlow Colombia - Plataforma Inteligente de Gestion Juridica y Vigilancia Judicial"
s.IconLocation = "shell32.dll,264"
s.Save
