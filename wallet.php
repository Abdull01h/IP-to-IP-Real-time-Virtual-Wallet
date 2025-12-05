<?php
// Optional: For persistent storage if Node.js server restarts
// Example: balance / transactions / admin
$dataFile = 'data.json';
if(!file_exists($dataFile)) file_put_contents($dataFile,json_encode([]));

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents($dataFile),true);

switch($action){
  case 'getUser': 
    $user = $_GET['user']??''; echo json_encode($data[$user]??null); break;
  case 'setUser':
    $user = $_POST['user']??''; $data[$user] = $_POST['data']??[]; 
    file_put_contents($dataFile,json_encode($data)); echo "OK"; break;
  case 'getAll': echo json_encode($data); break;
}
?>
