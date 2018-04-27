<?php

$nDisplay = 5;
if (isset($_GET['display'])) { 
    $nDisplay = floatval($_GET['display']); 
}

shell_exec('rm -rf out/*.jpg');
shell_exec('DISPLAY=:'.$nDisplay.' import -window root out/screen.jpg');

echo 'Date: '. date('Y-m-d H:i:s') . '<br />';
echo "<img src='out/screen.jpg?tm=".time()."' alt='' />";
