<?php

$userEmail = $_REQUEST["userEmail"];
$ctaName = $_REQUEST["name"];
$mailChimpKey = $_REQUEST["key"];

$fileName = "../../../tempData/notifyList";
$file = fopen( $fileName, "a" );
if( $file == false ) {
	echo "Error pulling newest emails";
	exit();
}
fwrite( $file, $userEmail."\n");
fclose( $file );

$server = explode('-',$mailChimpKey);
if ($server[1] === "undefined" || $server[1] == '') {
    echo "Invalid MailChimp API key \n Entered: ".$mailChimpKey;
    die();
}
$server = $server[1].".";

$con = new mysqli("localhost","root","","analytics");
//check if connection is valud
if ($con->connect_error)
{
    echo "Failed to connect to MySQL: " . $con->connect_error;
}
$tableName = str_replace('@', 'AT', $userEmail);
$tableName = str_replace('.', 'DOT', $tableName);
// Perform queries
$queryString = "SELECT email, text_collected from ".$tableName." WHERE email != '' AND name = '".$ctaName."'";
$data = $con->query($queryString);
$con->close();

$NewListJson = json_encode([
    "id"=> "SomeId",
    "name"=> "Emails captured with CTA: ".$ctaName,
    "contact"=> [
        "company"=> "Aiva Labs",
        "address1"=> "Suite 301A, 175 Longwood Rd S",
        "city"=> "Hamilton",
        "state"=> "ON",
        "zip"=> "L8P 0A1",
        "country"=> "CA",
    ],
    "permission_reminder"=> "Email captured using an Aiva Labs call to action",
    "use_archive_bar"=> true,
    "campaign_defaults"=> [
        "from_name"=> "insertYourNameHere",
        "from_email"=> "insertYourEmailHere@insertYourDomainHere.ca",
        "subject"=> "Insert Email Subject Here",
        "language"=> "en"
    ],
    "email_type_option"=> True,   
]);

$ch = curl_init();
$auth = base64_encode( 'user:'. $mailChimpKey );
curl_setopt($ch, CURLOPT_URL, 'https://'.$server.'api.mailchimp.com/3.0/lists');
curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json','Authorization: Basic '. $auth));
curl_setopt($ch, CURLOPT_USERAGENT, 'PHP-MCAPI/2.0');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 20);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "POST");
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_POSTFIELDS, $NewListJson);
$createListResult = curl_exec($ch);
$listIdReturned = explode(":",$createListResult);
$listIdReturned = str_replace(array('"',',','name'), '', $listIdReturned[1]);
$createListhttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);



curl_setopt($ch, CURLOPT_URL, 'https://'.$server.'api.mailchimp.com/3.0/lists/'.$listIdReturned.'/members');

while($row = $data->fetch_assoc()) {
    $newMemberArray = array();
    $mergeFieldsArray = array();
    
    $emailArray = explode(',',$row["email"]);
    $emailCount = count($emailArray);
    echo $emailCount;
    foreach ($emailArray as &$labelAndEmail) {
        $labelAndEmail = explode(" = ", $labelAndEmail);
    }
    
    $textArray = explode(',',$row["text_collected"]);
    $textCount = count($textArray);
    echo $textCount;
    foreach ($textArray as &$labelAndText) {
        $labelAndText = explode(" = ", $labelAndText);
    }
    
    echo "Email Row: ".$row["email"];
    echo "Text Row: ".$row["text_collected"];
    
    $emailIndex = 0;
    $textIndex = 0;
    while( $emailCount > 0 ) {
        if($emailIndex == 0) {
            $newMemberArray['email_address'] = $emailArray[$emailIndex][1];
        }
        else {
            $mergeFieldsArray[$emailArray[$emailIndex][0]] = $emailArray[$emailIndex][1];
        }
        
        $emailIndex++;
        $emailCount--;
    }
    while( $textCount > 0 && isset($textArray[$textIndex][1])) {
        $mergeFieldsArray[$textArray[$textIndex][0]] = $textArray[$textIndex][1];
        $textIndex++;
        $textCount--;
    }
    if (isset($textArray[$textIndex-1][1])) {
        $newMemberArray['merge_fields'] = $mergeFieldsArray;
    }

    $newMemberArray['status'] = 'subscribed';
    
    $newMembersJson = json_encode($newMemberArray);
    
    curl_setopt($ch, CURLOPT_POSTFIELDS, $newMembersJson);
    $addNewMembersResult = curl_exec($ch);
    $addNewMembershttpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($addNewMembershttpCode == "200") {
    echo $row["email"]." added!\n";
    }
    else {
        echo 'Error in adding email '.$row["email"].' Error code: '.$addNewMembersResult."\n";
    }
    
}

curl_close($ch);

if ($createListhttpCode == "200") {
    echo "\nAiva Labs email list for CTA ".$ctaName." created!";
}
else {
    echo "\nError in list creation. Error code: ".$createListhttpCode;
}

?>