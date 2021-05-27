
let mymap = L.map('mapId').setView([2, 1], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap); 




    citygeoJSON = L.geoJson([], {
        onEachFeature: function (cityFeature, layer) {

        layer.bindPopup(cityFeature.properties.popupContent);
        },
        pointToLayer: function (cityFeature, latlng) {
            
            var color,
                radius,
                pop;

            pop = 5 * Math.sqrt(Math.ceil(parseInt(cityFeature.properties.population.replace(/,|<| /g, ''))/1000000));
            color = 'black';
            radius = pop;
            
            return L.circleMarker(latlng, {
                color: color,
                radius: radius
            });
                
        }
});


var overlays = {
    "Major Cities" : citygeoJSON
};

L.control.layers(overlays).addTo(mymap);

homeCurrency= '';

$(document).ready(function(){
    navigator.geolocation.getCurrentPosition( geolocationCallback);
});

function geolocationCallback(position){
    var lat= position.coords.latitude;
    var lng = position.coords.longitude;

    var latlng = new L.LatLng(lat, lng);

    mymap = mymap.setView(latlng, 5);


L.marker(latlng, {title: 'Your Location'}).addTo(mymap);

$.ajax({
    url: "libs/php/latAndLng.php",
    type: "POST",
    dataType: 'json',
    data: {
        lat: lat,
        lng: lng,

    },
    
    success: function(result) {

        getData(result['data']['country']);
    },

    error: function(jqXHR, exception){
        errorajx(jqXHR, exception);
        console.log("latitude and longitude error")
    }
 });
};

$.ajax({
    url: 'libs/php/countrySelect.php',
    type: 'POST',
    dataType: 'json',
    success: function(result){
        $.each(result.data, function(index) {
            $('#country').append($("<option>", {
                value: result.data[index].code,
                text: result.data[index].name
            }));
        });
    },

    error: function(jqXHR, exception) {
        errorajx(jqXHR, exception);
        console.log("Option select error");
    }

});

var borderGroup = L.featureGroup([]);

function getData(code) {
    $.ajax({
        url: "libs/php/data.php",
        type: 'POST',
        dataType: 'json',
        data: {
            alpha3Code: code,
            
        },

        success: function(response) {
            console.log(JSON.stringify(response));
            var rest = response['data']['rest'];
            
            document.getElementById('country').value = rest['alpha3Code'];

            citygeoJSON.clearLayers();
            borderGroup.clearLayers();

            var cap;
            if(rest['capital'] == ""){
                cap=("<tr><td class='right'>Capital: </td><td class='left'>Not Available</td></tr>");
            } else {
                cap = ("<tr><td class='right'> Capital: </td><td class='left'>" + rest['capital'] +  "</td></tr>");
            };

            var sub;
            if (rest['subregion'] == "") {
                sub = ("<tr><td class='right'> Subregion: </td><td class='left'> Not Available</td></tr>");
            } else {
                sub = ("<tr><td class='right'> Subregion: </td><td class='left'>" + rest['subregion'] +  "</td></tr>");
            };

            var genPopup = L.popup({className: 'gen'}).setContent(
                "<table>" +
                    "<tr>" +
                        "<td colspan='2' id='space'>" + "<img src=" + rest['flag'] + " id='flag' ></img></td>" + 
                    "</tr>" +
                    "<tr>" +
                        "<td colspan='2' id='space'>" + "<b> " + rest['name'] +  " (" + rest['alpha2Code'] + ")" + " </b>" + "</td>" + 
                    "</tr>" + 
                    "<tr>" +
                        "<td class='right'> Native name: </td>" + 
                        "<td class='left'>" + rest['nativeName'] + "</td>" +
                    "</tr>" + 
                    "<tr>" +
                        cap + 
                    "</tr>" + 
                    "<tr>" + 
                        "<td class='right'> Continent: </td>"  + 
                        "<td class='left'>" + rest['region'] +
                    "</tr>" + 
                    "<tr>" + 
                        sub + 
                    "</tr>" + 
                    "<tr>" + 
                        "<td class='right'> Language: </td>"  + 
                        "<td class='left'> " + rest['languages'][0]['name'] + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td class='right'> Population: </td>"  + 
                        "<td class='left'>" + (rest['population']) + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td class='right'> Area: </td>" + 
                        "<td class='left'>" + (Math.round(rest['area'])) + " Km"+ '&#178' + "</td>" +
                    "</tr>" + 
                    "<tr>" +
                        "<td class='right'> Calling Code: </td>" + 
                        "<td class='left'> +" + rest['callingCodes'] + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td class='right'> Top Level Domain: </td>" + 
                        "<td class='left'>" + rest['topLevelDomain'] + "</td>" +
                    "</tr>" + 
                    "<td class='right'> Time Zones: </td>" + 
                    "<td class='left'>" + rest['timezones'][0] + "</td>" +
                "</tr>" +
                "</tr>" + 
                "<td class='right'> Currency: </td>" + 
                "<td class='left'>" + rest['currencies'][0]['name'] + "</td>" +
            "</tr>" +
            "</tr>" + 
            "<td class='right'> Currency Symbol: </td>" + 
            "<td class='left'>" + rest['currencies'][0]['symbol'] + "</td>" +
        "</tr>" +
                "</table>"
            ).setLatLng(rest['latlng']);

            var myStyle = {
                color: '#4497b2',
                opacity: 1,
                fillOpacity: 0.4,
                fillColor: '#b04d8f',
                dashArray: '6, 4',
                weight: 2
            };

            L.geoJson(response['data']['borders'], {
                style: myStyle
            }).addTo(borderGroup);

            borderGroup.bindPopup(genPopup).addTo(mymap);

            mymap.fitBounds(borderGroup.getBounds()).openPopup(genPopup);
        
            $('#weather1').empty().append('<img id="mainWeathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][0]['weather'][0]['icon'] + '@2x.png"></img>');
            $('#weather2').empty().append(response['data']['forecast']['daily'][0]['weather'][0]['main']);
            $('#weather3').empty().append(response['data']['forecast']['daily'][0]['weather'][0]['description']);
            $('#weather4').empty().append(response['data']['forecast']['daily'][0]['clouds'] + '%');
            $('#weather5').empty().append((response['data']['forecast']['daily'][0]['temp']['morn'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather6').empty().append((response['data']['forecast']['daily'][0]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather7').empty().append((response['data']['forecast']['daily'][0]['temp']['max'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather8').empty().append((response['data']['forecast']['daily'][0]['temp']['min'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather9').empty().append(response['data']['forecast']['daily'][0]['pressure'] + ' mbar');
            $('#weather10').empty().append(response['data']['forecast']['daily'][0]['humidity'] + '%');
            $('#weather11').empty().append(response['data']['forecast']['daily'][0]['wind_speed'] + 'm/s');
            $('#weather12').empty().append(response['data']['forecast']['daily'][0]['wind_deg'] + '\u00B0');
   

            $('#forecast1').empty().append('<b>' + day(response['data']['forecast']['daily'][1]['dt']).substring(0,3) + '</b>');
            $('#forecast2').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][1]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast3').empty().append((response['data']['forecast']['daily'][1]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast4').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][1]['weather'][0]['description']));
            $('#forecast5').empty().append('<b>' + day(response['data']['forecast']['daily'][2]['dt']).substring(0,3) + '</b>');
            $('#forecast6').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][2]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast7').empty().append((response['data']['forecast']['daily'][2]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast8').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][2]['weather'][0]['description']));
            $('#forecast9').empty().append('<b>' + day(response['data']['forecast']['daily'][3]['dt']).substring(0,3) + '</b>');
            $('#forecast10').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][3]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast11').empty().append((response['data']['forecast']['daily'][3]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast12').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][3]['weather'][0]['description']));
            $('#forecast13').empty().append('<b>' + day(response['data']['forecast']['daily'][4]['dt']).substring(0,3) + '</b>');
            $('#forecast14').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][4]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast15').empty().append((response['data']['forecast']['daily'][4]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast16').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][4]['weather'][0]['description']));
            $('#forecast17').empty().append('<b>' + day(response['data']['forecast']['daily'][5]['dt']).substring(0,3) + '</b>');
            $('#forecast18').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][5]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast19').empty().append((response['data']['forecast']['daily'][5]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast20').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][5]['weather'][0]['description']));
            $('#forecast21').empty().append('<b>' + day(response['data']['forecast']['daily'][6]['dt']).substring(0,3) + '</b>');
            $('#forecast22').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][6]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast23').empty().append((response['data']['forecast']['daily'][6]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast24').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][6]['weather'][0]['description']));
            $('#forecast25').empty().append('<b>' + day(response['data']['forecast']['daily'][7]['dt']).substring(0,3) + '</b>');
            $('#forecast26').empty().append('<img id="weathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][7]['weather'][0]['icon'] + '@2x.png"></img');
            $('#forecast27').empty().append((response['data']['forecast']['daily'][7]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#forecast28').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][7]['weather'][0]['description']));
        },

        error: function(jqXHR, exception) {
            errorajx(jqXHR, exception);
            console.log("Data error");
        }
    });
};

function day(timestamp) {

    const milliseconds = timestamp * 1000
    const dateObject = new Date(milliseconds)
    const humanDateFormat = dateObject.toLocaleString("en-US", {weekday: "long"}) + "</br>" + dateObject.toLocaleString("en-US", {month: "long"}) +  " " + dateObject.toLocaleString("en-US", {day: "numeric"});
    return humanDateFormat
};

function capitalizeFirstLetter(string) {

    return string.charAt(0).toUpperCase() + string.slice(1);
};


function errorajx(jqXHR, exception) {

    var msg = '';
        if (jqXHR.status === 0) {
            msg = 'Not connect.\n Verify Network.';
        } else if (jqXHR.status == 404) {
            msg = 'Requested page not found. [404]';
        } else if (jqXHR.status == 500) {
            msg = 'Internal Server Error [500].';
        } else if (exception === 'parsererror') {
            msg = 'Requested JSON parse failed.';
        } else if (exception === 'timeout') {
            msg = 'Time out error.';
        } else if (exception === 'abort') {
            msg = 'Ajax request aborted.';
        } else {
            msg = 'Uncaught Error.\n' + jqXHR.responseText;
        }
        console.log(msg);
};



function easyButton(name, icon) {
    L.easyButton({
        states:[ 
          {
            icon: icon,
            title: name + ' Data',
            onClick: function (){
    
                switch(name) {
                    case 'Weather':
                        $('#weather-modal').modal('show');
                        break;

                    case 'Forecast':
                        $('#forecast-modal').modal('show');
                        break;
                        
                   };
            }
          }
        ]
    }).addTo(mymap);
};

    


weatherEasy= new easyButton('Weather', '&#x1F326');
forecastEasy = new easyButton('Forecast', '&#55');



