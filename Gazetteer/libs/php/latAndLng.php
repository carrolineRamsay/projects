<?php

    ini_set('display_errors', 'On');
    error_reporting(E_ALL);

    $executionStartTime = microtime(true);

    $ch = curl_init('http://api.geonames.org/countryCodeJSON?lat=' . $_REQUEST['lat'] . '&lng=' . $_REQUEST['lng'] . '&username=taskpage');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $countryData = curl_exec($ch);
    curl_close($ch);

    $code = json_decode($countryData, true);

    

    $ch1 = curl_init('http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $code['countryCode'] . '&username=taskpage&style=full;');
    curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

    

    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['country'] = $code['countryCode'];
    

    header('Content-Type: application/json; charset=UTF-8');

    echo json_encode($output);
    
?>