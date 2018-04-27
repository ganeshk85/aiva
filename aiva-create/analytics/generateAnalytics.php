<?php
	function getIfSet(&$value, $default = null) {
		return isset($value) ? $value : $default;
	}

	function getIfZ(&$value, $default = 1) { 
		return ($value !== 0) ? $value : $default;
	}

	$exportFile = "exportSuccess.json";

	$email = $_REQUEST["userEmail"];
	$table = str_replace('@', 'AT', $email);
	$table = str_replace('.', 'DOT', $table);

//	$numSuccess = 0;

	$day =  date("w");
	$date = date("d");
	$month = date("n");
	$year = date("Y");

	$servername = "localhost";
	$dbname = "analytics";
	$username = "root";

	$export = array();
//	$export["success_total"] = $numSuccess;

	$conn = mysqli_connect($servername, $username, $password, $dbname);

	if (!$conn) {
		die ("Connection failed:" . mysqli_connect_error());
	}

	if ($day === "0") {
		$weekEndQ = strtotime($year . "-" . $month . "-" . $date . " 00:00:00");
	} else {
		$weekEndQ = strtotime("last sunday");
	}
	$weekStartQ = strtotime("-7 days", $weekEndQ);
	$weekPrevStartQ = strtotime("-7 days", $weekStartQ);
	$weekPrevEndQ = strtotime("-7 days", $weekEndQ);

	$monthEndQ = strtotime($year . "-" . $month . "-01");
	if (--$month === "0") {
		$month = "12";
		--$year;
	}
	$monthStartQ = strtotime($year . "-" . $month . "-01");
	$monthPrevStartQ = strtotime("-1 month", $monthStartQ);
	$monthPrevEndQ = strtotime("-1 month", $monthEndQ);

/*
	echo date("Y-m-d h:m:s", $monthStartQ) . "</br>";
        echo date("Y-m-d h:m:s", $monthEndQ) . "</br>";
        echo date("Y-m-d h:m:s", $monthPrevStartQ). "</br>";
        echo date("Y-m-d h:m:s", $monthPrevEndQ) . "</br>";
	echo "</br>";
        echo date("Y-m-d h:m:s", $weekStartQ) . "</br>";
        echo date("Y-m-d h:m:s", $weekEndQ) . "</br>";
        echo date("Y-m-d h:m:s", $weekPrevStartQ) . "</br>";
        echo date("Y-m-d h:m:s", $weekPrevEndQ) . "</br>";
*/
	$sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekStartQ) . "' and '" . date("Y-m-d", $weekEndQ) . "'";
//	echo $sql . "</br>";
	if ($res = mysqli_query($conn, $sql)) {
		$data = mysqli_fetch_assoc($res);
		$weekTotal = $data["result"];
//		echo $weekTotal . "</br>";
		mysqli_free_result($res);
	} else {
		echo "Failed " . $conn->error;
	}

	$sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekPrevStartQ) . "' and '" . date("Y-m-d", $weekPrevEndQ) . "'";
//	echo $sql . "</br>";
	if ($res = mysqli_query($conn, $sql)) {
		$data = mysqli_fetch_assoc($res);
		$weekPrevTotal = $data["result"];
//		echo $weekPrevTotal . "</br>";
		mysqli_free_result($res);
	} else {
		echo "Failed " . $conn->error;
	}


        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekStartQ) . "' and '" . date("Y-m-d", $weekEndQ) . "' and cta = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $weekCtaTotal = $data["result"];
//		echo $weekCtaTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekPrevStartQ) . "' and '" . date("Y-m-d", $weekPrevEndQ) . "' and cta = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $weekPrevCtaTotal = $data["result"];
//		echo $weekPrevCtaTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekStartQ) . "' and '" . date("Y-m-d", $weekEndQ) . "' and success = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $weekSuccessTotal = $data["result"];
//		echo $weekSuccessTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $weekPrevStartQ) . "' and '" . date("Y-m-d", $weekPrevEndQ) . "' and success = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $weekPrevSuccessTotal = $data["result"];
//		echo $weekPrevSuccessTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthStartQ) . "' and '" . date("Y-m-d", $monthEndQ) . "'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthTotal = $data["result"];
//		echo $monthTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthPrevStartQ) . "' and '" . date("Y-m-d", $monthPrevEndQ) . "'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthPrevTotal = $data["result"];
//		echo $monthPrevTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthStartQ) . "' and '" . date("Y-m-d", $monthEndQ) . "' and cta = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthCtaTotal = $data["result"];
//		echo $monthCtaTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthPrevStartQ) . "' and '" . date("Y-m-d", $monthPrevEndQ) . "' and cta = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthPrevCtaTotal = $data["result"];
//		echo $monthPrevCtaTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthStartQ) . "' and '" . date("Y-m-d", $monthEndQ) . "' and success = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthSuccessTotal = $data["result"];
//		echo $monthSuccessTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

        $sql = "select count(*) as result from " . $table . " where log_date between '" . date("Y-m-d", $monthPrevStartQ) . "' and '" . date("Y-m-d", $monthPrevEndQ) . "' and success = '1'";
//	echo $sql . "</br>";
        if ($res = mysqli_query($conn, $sql)) {
                $data = mysqli_fetch_assoc($res);
                $monthPrevSuccessTotal = $data["result"];
//		echo $monthPrevSuccessTotal . "</br>";
                mysqli_free_result($res);
        } else {
                echo "Failed " . $conn->error;
        }

	$weekConv = intval($weekSuccessTotal/$weekCtaTotal*100);
	$weekPrevConv = intval($weekPrevSuccessTotal/$weekPrevCtaTotal*100);
	$monthConv = intval($monthSuccessTotal/$monthCtaTotal*100);
	$monthPrevConv = intval($monthPrevSuccessTotal/$monthPrevCtaTotal*100);

	$weekDeltaTotal = intval(($weekTotal-$weekPrevTotal)/getIfZ($weekPrevTotal)*100);
	$monthDeltaTotal = intval(($monthTotal-$monthPrevTotal)/getIfZ($monthPrevTotal)*100);

	$weekDeltaConv = intval(($weekConv-$weekPrevConv)/getIfZ($weekPrevConv)*100);
	$monthDeltaConv = intval(($monthConv-$monthPrevConv)/getIfZ($monthPrevConv)*100);

	$weekDeltaCta = intval(($weekCtaTotal-$weekPrevCtaTotal)/getIfZ($weekPrevCtaTotal)*100);
	$monthDeltaCta = intval(($monthCtaTotal-$monthPrevCtaTotal)/getIfZ($monthPrevCtaTotal)*100);

	$results = array();
	$month = array();
	$week = array();

	$month["visitTotal"] = $monthTotal;
	$month["deltaTotal"] = $monthDeltaTotal;
	$month["conversion"] = $monthConv;
	$month["deltaConv"] = $monthDeltaConv;
	$month["ctaTotal"] = $monthCtaTotal;
	$month["deltaCta"] = $monthDeltaCta;

        $week["visitTotal"] = $weekTotal;
        $week["deltaTotal"] = $weekDeltaTotal;
        $week["conversion"] = $weekConv;
        $week["deltaConv"] = $weekDeltaConv;
        $week["ctaTotal"] = $weekCtaTotal;
        $week["deltaCta"] = $weekDeltaCta;

	$results["month"] = $month;
	$results["week"] = $week;

	echo "Calculated Results.";
//	var_dump($results);

/*
	$sql = "select * from " . $table ; 
	$success = array();

	if ($res = mysqli_query($conn, $sql)) {
		while ($row = mysqli_fetch_assoc($res)) {
			if ($row["SUCCESS"] !== '0') {
				$temp = array();
				foreach ($row as $key => $value) {
					if ($value !== '') {
//						echo $key . "=>" . $value . "<br>";
						$temp[$key] = $value;
					}
				}
				$success[$row["ID"]] = $temp;
				$numSuccess++;
			}
		}
		mysqli_free_result($res);
	} else {
		echo "Failed" . $conn->error;
	}

	$export["success_total"] = $numSuccess;
*/
	$export["results"] = $results;
//	$export["success"] = array_values($success);

	//Create folder for user
	if (!file_exists($email)) {
		if(!mkdir($email, 0777, true)) {
        		die("Failed to make folder " . $table);
    		}
	}

	$fp = fopen ($email . '/' . $exportFile, "w");
	fwrite($fp, json_encode($export));
	fclose($fp);
	chmod($exportFile, 0777);
//	header("Location: " . $exportFile);

?>

