$filePath = 'C:\Users\Grupo Andino\.gemini\antigravity\brain\f1a41683-fbd1-455a-af46-27a63ce92bd4\.system_generated\steps\1930\content.md'
$content = Get-Content -Path $filePath -Raw
$regex = [regex]'<div>(\d{1,2})\s*-\s*([^<]+)</div>'
$matchColl = $regex.Matches($content)
$list = @()
foreach ($m in $matchColl) {
    $num = $m.Groups[1].Value
    $rawName = $m.Groups[2].Value.Trim()
    # Format Title Case
    $name = (Get-Culture).TextInfo.ToTitleCase($rawName.ToLower())
    $list += [PSCustomObject]@{
        num = $num
        name = $name
    }
}

Write-Output "Total matches: $($list.Count)"
$sorted = $list | Sort-Object {
    if ($_.num -eq '00') { return -2 }
    if ($_.num -eq '0') { return -1 }
    return [int]$_.num
}

$output = "const ANIMALITOS_SELVA_PLUS_LIST = [`r`n"
foreach ($item in $sorted) {
    $output += "  { num: '$($item.num)', name: '$($item.name)' },`r`n"
}
$output += "];`r`n"

$outPath = 'C:\Users\Grupo Andino\.gemini\antigravity\scratch\datos-orbet\scratch\selvaplus_list.js'
$output | Out-File -FilePath $outPath -Encoding utf8
Write-Output "Saved to $outPath"
Write-Output "Items count: $($sorted.Count)"
