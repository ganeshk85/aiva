<?php
	function getIfSet(&$value, $default = null) {
		return isset($value) ? $value : $default;
	}

	$exportFile = "exportSuccess.json";

	$email = $_REQUEST["userEmail"];
	$table = str_replace('@', 'AT', $email);
	$table = str_replace('.', 'DOT', $table);

	$startQ = $_REQUEST["start"];
	$endQ = $_REQUEST["end"];

	if (!isset($email) || !isset($startQ) || !isset($endQ)) {
		die ("Missing variables.");
	}

	$servername = "localhost";
	$dbname = "analytics";
	$username = "root";

	$directory = '/var/www/html/aiva-create/analytics/';
	$fileName = $email . "/" . "raw_" . $startQ . "_" . $endQ . ".csv";

	$conn = mysqli_connect($servername, $username, $password, $dbname);
	if (!$conn) {
		die ("Connection failed:" . mysqli_connect_error());
	}

	if (!file_exists($email)) {
		if(!mkdir($email, 0777, true)) {
        		die("Failed to make folder " . $table);
    		}
	}

	if (file_exists($fileName)) {
		unlink($fileName);
	}

	$sql = "select 'Date', 'Elapsed Time', 'Device', 'Location', 'Prev. Site', 'Curr. Site', 'Name', 'Email', 'Cta', 'Success'
		union all
		select date, elapsed_time, device, location, prev_site, curr_site, name, email, cta, success into outfile '$directory/$fileName' fields terminated by ',' lines terminated by '\n' from $table where log_date between '$startQ' and '$endQ'"; 

	if ($res = mysqli_query($conn, $sql)) {
		echo "File made.";
	} else {
		echo "Failed " . $conn->error;
	}
?>

