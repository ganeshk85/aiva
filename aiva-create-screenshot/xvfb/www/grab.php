<?php

shell_exec('rm -rf out/*.jpg out/*.png');
shell_exec('DISPLAY=:5 import -window root out/screen.jpg');

echo 'Date: '. date('Y-m-d H:i:s') . '<br />';
echo "<img src='out/screen.jpg?tm=".time()."' alt='' />";
