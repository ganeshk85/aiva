<?php

function prepForJson($fullString) {
    if (!empty($fullString)) {
        $elementHolder = explode(",", $fullString);
        $fullString = array();
        for ($i = 0; $i < count($elementHolder); $i++) {
            $valueArray = explode(" = ", $elementHolder[$i]);
            $fullString[$valueArray[0]] = $valueArray[1];
        }
        return $fullString;
    } else {
      return "";  
    }
}

$userEmail = $_REQUEST["userEmail"];
$ctaName = $_REQUEST["name"];

$con = new mysqli("localhost","root","","analytics");
//check if connection is valud
if ($con->connect_error)
{
    echo "Failed to connect to MySQL: " . $con->connect_error;
}
$tableName = str_replace('@', 'AT', $userEmail);
$tableName = str_replace('.', 'DOT', $tableName);
// Perform queries
$queryString = "SELECT * from ".$tableName." where name = '".$ctaName."'";
$data = $con->query($queryString);
$con->close();

if ($data->num_rows > 0) {
    
    // output data of each row
    while($row = $data->fetch_assoc()) {
        $row["email"] = prepForJson($row["email"]);
        $row["text_collected"] = prepForJson($row["text_collected"]);
        
        $emparray[] = $row;
    }
    echo json_encode($emparray);

} else {
    echo "No analytics collected :(";
}
?>