Add-Type -AssemblyName System.Drawing

function Create-AppIcon {
    param(
        [int]$size,
        [string]$path
    )
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    # Background gradient: Royal Blue
    $rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $rect,
        [System.Drawing.Color]::FromArgb(11, 37, 69),
        [System.Drawing.Color]::FromArgb(2, 132, 199),
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )
    $g.FillRectangle($brush, $rect)

    # Decorative border
    $borderPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(200, 56, 189, 248), [Math]::Max(2, [int]($size * 0.03)))
    $margin = [int]($size * 0.06)
    $g.DrawEllipse($borderPen, $margin, $margin, ($size - 2 * $margin), ($size - 2 * $margin))

    $fontFamily = New-Object System.Drawing.FontFamily("Arial")
    
    # Text 'DO' (Datos Orbet)
    $fontSize = [int]($size * 0.28)
    $font = New-Object System.Drawing.Font($fontFamily, $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    
    $y1 = [float]($size * 0.18)
    $h1 = [float]($size * 0.40)
    $textRect = New-Object System.Drawing.RectangleF(0.0, $y1, [float]$size, $h1)
    $whiteBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $g.DrawString("DO", $font, $whiteBrush, $textRect, $sf)

    # Subtext 'ORBET'
    $goldBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(250, 204, 21))
    $subFontSize = [Math]::Max(8, [int]($size * 0.11))
    $subFont = New-Object System.Drawing.Font($fontFamily, $subFontSize, [System.Drawing.FontStyle]::Bold)
    $y2 = [float]($size * 0.60)
    $h2 = [float]($size * 0.25)
    $subRect = New-Object System.Drawing.RectangleF(0.0, $y2, [float]$size, $h2)
    $g.DrawString("ORBET", $subFont, $goldBrush, $subRect, $sf)

    $g.Dispose()
    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
}

$baseDir = "C:\Users\Grupo Andino\.gemini\antigravity\scratch\datos-orbet\icons"
Create-AppIcon -size 192 -path "$baseDir\icon-192.png"
Create-AppIcon -size 512 -path "$baseDir\icon-512.png"
Create-AppIcon -size 64 -path "$baseDir\favicon.png"
Write-Host "Icons generated successfully!"
