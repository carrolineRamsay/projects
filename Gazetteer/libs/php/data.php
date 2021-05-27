<?php

	
    ini_set('display_errors', 'On');
    error_reporting(E_ALL);
    ini_set('memory_limit', '1024M');

    $executionStartTime = microtime(true);

   
    $country = $_POST['alpha3Code'];
 

    
    $ch = curl_init('https://restcountries.eu/rest/v2/alpha/' . $country);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
  
    $result = curl_exec($ch);
    
    curl_close($ch);

    
    $rest = json_decode($result, true);
    $countryBorders = json_decode(file_get_contents("countryBorders.geo.json"), true);
    $border = null;
  
     foreach ($countryBorders['features'] as $feature) {
  
         
         if ($feature["properties"]["iso_a2"] ==  $_REQUEST['alpha3Code'] || $feature["properties"]["iso_a3"] ==  $_REQUEST['alpha3Code'] ) {
  
             $border = $feature;
             break;
         }
         
     };

    

     
  $access_key = 'ccfca330c0b55e49d2b938bd7fd1cb2e'; 

  $ch1 = curl_init('api.openweathermap.org/data/2.5/onecall?lat='. $rest['latlng'][0] . '&lon='  . $rest['latlng'][1]  . '&exclude=current,hourly,minutely&appid=' . $access_key);
  curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);

  $forecastData = curl_exec($ch1);
 
  curl_close($ch1);

  $forecast = json_decode($forecastData, true);

    
$ch2 = curl_init('http://api.geonames.org/countryInfoJSON?formatted=true&country=' . $rest['alpha2Code'] . '&username=taskpage&style=full;');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);

    $geoData = curl_exec($ch2);
    
    curl_close($ch2);

    $geonames = json_decode($geoData, true);
	

    $ch4 = curl_init();

    curl_setopt_array($ch4, array(
        CURLOPT_URL => "https://geo-services-by-mvpc-com.p.rapidapi.com/cities/significant?pourcent=0.1&countrycode=" . $rest['alpha2Code'] . "&limit=15&language=en",
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_ENCODING => "",
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => "GET",
        CURLOPT_SSL_VERIFYHOST => false,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER => array(
            "x-rapidapi-host: geo-services-by-mvpc-com.p.rapidapi.com",
            "x-rapidapi-key: 2393be6a9fmsh9885dadb5cdf4e9p199e2djsn89e7f487773a"
        ),
    ));

    
    $cityData = curl_exec($ch4);
    
    curl_close($ch4);

    $city = json_decode($cityData, true); 


  
    $output['status']['code'] = "200";
    $output['status']['name'] = "ok";
    $output['status']['description'] = "success";
    $output['status']['executedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
    $output['data']['rest'] = $rest;
    $output['data']['borders'] = $border;
    $output['data']['forecast'] =$forecast;
   
    
    


    if (empty($city)) {
        $output['data']['city'] = "No data avaialable";
    } else {
        $output['data']['city'] = $city;
    };

   
    header('Content-Type: application/json; charset=UTF-8');

  
    echo json_encode($output);
    
?>