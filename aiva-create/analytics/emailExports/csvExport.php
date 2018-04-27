<?php

$userEmail = $_REQUEST["userEmail"];
$ctaName = $_REQUEST["name"];

$fileName = "../tempData/notifyList";
$file = fopen( $fileName, "a" );
if( $file == false ) {
	echo "Error pulling newest emails";
	exit();
}
fwrite( $file, $userEmail."\n");
fclose( $file );

$con = new mysqli("localhost","root","","analytics");
//check if connection is valud
if ($con->connect_error)
{
    echo "Failed to connect to MySQL: " . $con->connect_error;
}
$tableName = str_replace('@', 'AT', $userEmail);
$tableName = str_replace('.', 'DOT', $tableName);
// Perform queries
$queryString = "SELECT email from ".$tableName." WHERE email != '' AND name = '".$ctaName."'";
$data = $con->query($queryString);
$con->close();

if ($data->num_rows > 0) {

    $filename = '../../webExports/'.$userEmail.'/'.$ctaName.'.csv';
    $file = fopen( $filename, "w" );
    if( $file == false ) {
       echo ( "Error in opening csv output file" );
       exit();
    }
    $filesize = filesize( $filename );

    $emailArray = array();

    // output data of each row
    while($row = $data->fetch_assoc()) {
        $fullRow = explode(',',$row["email"]);
        foreach ($fullRow as $fullEmail) {
            $fullEmail = explode('=', $fullEmail);
            $emailName = trim($fullEmail[0]);
            $emailValue = trim($fullEmail[1]);
            array_push($emailArray, $emailValue);
            echo $emailName." = ".$emailValue."<br>";
        }
        fputcsv($file, $emailArray);
        unset($emailArray);
        $emailArray = array(); 
    }
    fclose( $file );

    //prep for download 
    //CURRENTLY NOT WORKING
    //Need to look into other output methods
    header('Content-Description: File Transfer');
    header('Content-Type: application/octet-stream');

    //Use Content-Disposition: attachment to specify the filename
    header('Content-Disposition: attachment; filename="'.basename($filename).'"');
    header('Content-Transfer-Encoding: binary');

    //No cache
    header('Expires: 0');
    header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
    header('Pragma: public');

    //Define file size
    header('Content-Length: ' . filesize($filename));
    readfile($filename);

} else {
    echo "No emails collected :(";
}
?>