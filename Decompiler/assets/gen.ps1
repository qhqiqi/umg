$ErrorActionPreference = "Continue"
$proj = "ed8104b6-e3c0-4ebd-8c21-e2085bf9127b"
$root = "C:\Users\hhh\Documents\deepseek-harness\default-workspace\DopamineDecompiler"
$img  = Join-Path $root "assets\img"
New-Item -ItemType Directory -Force -Path $img | Out-Null
$log  = Join-Path $root "assets\gen.log"
"=== start $(Get-Date -Format o) ===" | Out-File $log -Encoding utf8

$NEG = "。无文字，无字母，无logo，无水印，无签名"

$items = @(
  @{n="m1_plank"; r="1:1"; p="抽象的赛博朋克徽章，悬浮在近黑的深色背景正中，酸柠檬绿与电紫色渐变光，几何浮雕结构，金属拉丝与玻璃质感，中心是一个抽象的平板支撑人形剪影，周围细密粒子与光环，极简，高级，暗调" + $NEG},
  @{n="m1_water"; r="1:1"; p="抽象的赛博朋克徽章，悬浮在近黑的深色背景正中，冰蓝与青色水晶质感，水波折射与涟漪，中心是一滴悬浮的水珠，细密光点，金属边缘，极简，高级，暗调" + $NEG},
  @{n="m1_desk";  r="1:1"; p="抽象的赛博朋克徽章，悬浮在近黑的深色背景正中，暖金与琥珀色，中心是无数小方块从混乱排序为整齐网格的图案，浮雕金属与磨砂玻璃，极简，高级，暗调" + $NEG},
  @{n="m2_anxious"; r="2:3"; p="赛博朋克夜海，风平浪静，深蓝与墨色，远处一条极细的霓虹地平线，长曝光海面，极简构图，电影感，安静而辽阔" + $NEG},
  @{n="m2_calm";  r="2:3"; p="清晨薄雾中的赛博城市天台，柔和的青绿色光，远处模糊的高楼剪影，极简，安静，电影感，空气感" + $NEG},
  @{n="m2_tired"; r="2:3"; p="雨夜的城市窗户，霓虹倒影映在湿润的玻璃上，室内昏暗，冷暖对比，电影感，孤独，极简构图" + $NEG},
  @{n="m3_act1"; r="2:3"; p="黑暗走廊尽头的一扇半开的门，门缝里透出冰冷的青蓝色光，地面反射微光，悬疑，电影感，极简构图，暗调" + $NEG},
  @{n="m3_act2"; r="2:3"; p="门后是一个巨大的空旷空间，悬浮的锥形几何体缓慢旋转，灰尘在倾斜的光束中漂浮，悬疑，电影感，暗调" + $NEG},
  @{n="m3_act3"; r="2:3"; p="远景，一个人形剪影站在巨大的发光几何结构之前，渺小与壮丽，冷色调，雾气，电影感" + $NEG},
  @{n="m4_honor"; r="4:5"; p="华丽的抽象奖章，金属浮雕，酸柠檬绿与金色辉光，暗色背景，光束穿过尘埃，庄重，极简，高级" + $NEG},
  @{n="m4_decay"; r="4:5"; p="锈迹斑斑的破败金属表面，暗红色与铁锈褐，裂纹与氧化，腐败的有机纹理，压抑，微距摄影，粗糙" + $NEG},
  @{n="m5_ideal"; r="3:4"; p="极简的日式房间，午后阳光从纱帘透入，浅色木质地板，一尘不染，整齐的书桌与植物，柔和的阴影，建筑摄影，平静" + $NEG}
)

foreach($it in $items){
  $dest = Join-Path $img ($it.n + ".jpg")
  if(Test-Path $dest){ "[skip] $($it.n)" | Out-File $log -Append -Encoding utf8; continue }
  "[gen ] $($it.n)" | Out-File $log -Append -Encoding utf8
  $raw = (dreamina-canvas node create image --project-id $proj --mode t2i --model seedream_5.0_lite `
          --ratio $it.r --resolution 2K --prompt $it.p --credit-ceiling 80 --run --wait --format json 2>&1) | Out-String
  $i = $raw.IndexOf('{"schemaVersion"')
  if($i -lt 0){ "[fail] $($it.n) no-json: $($raw.Substring(0,[Math]::Min(300,$raw.Length)))" | Out-File $log -Append -Encoding utf8; continue }
  try {
    $obj = $raw.Substring($i) | ConvertFrom-Json
  } catch {
    "[fail] $($it.n) parse" | Out-File $log -Append -Encoding utf8; continue
  }
  if(-not $obj.ok){ "[fail] $($it.n) $($obj.error.code)" | Out-File $log -Append -Encoding utf8; continue }
  $res = $obj.data.submission.resources[0].resourceId
  $dl = (dreamina-canvas resource download $res --project-id $proj -o $dest --format json 2>&1) | Out-String
  "[done] $($it.n) -> $res" | Out-File $log -Append -Encoding utf8
}
"=== end $(Get-Date -Format o) ===" | Out-File $log -Append -Encoding utf8
