
/*let mymap = L.map('mapId').setView([0, 0], 1);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(mymap); */


var street = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 2,
        id: 'mapbox/streets-v11',
        tileSize: 500,
        zoomOffset: -1,
        /*accessToken: 'pk.eyJ1IjoiY3JhbXNheSIsImEiOiJja29uY2EybHYwMDJ5MnZzMng4enU4MnFuIn0.H_BL-4hdPB4coG1HjgcYlQ'*/
        accessToken: 'pk.eyJ1IjoibXlsZXNraW5nIiwiYSI6ImNraDY5aHF1MDA4bXMycG81NXdydDIwNW8ifQ.LiVIW0kbaS-7qDJc4S9IyQ'
}),
    sattelite = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        minZoom: 2,
        id: 'mapbox/satellite-v9', 
        tileSize: 500,
        zoomOffset: -1,
        /*accessToken: 'pk.eyJ1IjoiY3JhbXNheSIsImEiOiJja29uY2EybHYwMDJ5MnZzMng4enU4MnFuIn0.H_BL-4hdPB4coG1HjgcYlQ'*/
        accessToken: 'pk.eyJ1IjoibXlsZXNraW5nIiwiYSI6ImNraDY5aHF1MDA4bXMycG81NXdydDIwNW8ifQ.LiVIW0kbaS-7qDJc4S9IyQ'
}), 

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

var mymap= L.map('mapId', {
    layers: [street, citygeoJSON]
});

var baseLayers = { 
    "Streets Map": street,
    "Satelite Map": sattelite
};

var overlays = {
    "Major Cities" : citygeoJSON
};

L.control.layers(baseLayers, overlays).addTo(mymap);

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

        homeCurrency= result['data']['currencies'];
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
            iso: code,
            currency: homeCurrency
        },

        success: function(response) {
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
                        "<td class='left'>" + commas(rest['population']) + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td class='right'> Area: </td>" + 
                        "<td class='left'>" + commas(Math.round(rest['area'])) + " Km"+ '&#178' + "</td>" +
                    "</tr>" + 
                    "<tr>" +
                        "<td class='right'> Calling Code: </td>" + 
                        "<td class='left'> +" + rest['callingCodes'] + "</td>" +
                    "</tr>" +
                    "<tr>" +
                        "<td class='right'> Top Level Domain: </td>" + 
                        "<td class='left'>" + rest['topLevelDomain'] + "</td>" +
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

            newsArray = response['data']['city']['data'];
            var feature= [];

            for(j=0; j< newsArray.length; j++) {

                if(newsArray[j]['population'] < 10000) {
                    pop = '< 10,000';
                } else {
                    pop = commas(newsArray[j]['population']);
                };

                var data = L.popup({className: 'news'}).setContent(
                    "<table>" + 
                        "<tr>" + 
                            "<td colspan='2'><b>" + newsArray[j]['name'] + "</b></td>" + 
                        "</tr>" + 
                        "<tr>" + 
                            "<td class='right'>Population: </td>" +
                            "<td class='left'>" + pop + "</td>" + 
                        "</tr>" + 
                        "<tr>" + 
                            "<td class='right'>Timezone: </td>" +
                            "<td class='left'>" + newsArray[j]['timezone'] + "</td>" + 
                        "</tr>" + 
                    "</table>"
                );

                var cityHold = {
                    "type": "Feature",
                    "properties": {
                        "popupContent": data,
                        "population": pop
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [newsArray[j]['longitude'], newsArray[j]['latitude']]
                    }
                };

                feature.push(cityHold);
            };

            var cityData = {"type": "FeatureCollection", "features": feature};

            citygeoJSON.addData(cityData);

            var feature = [];

            var rate;

            if (isNaN(response['data']['exchange'])) {
                rate = response['data']['exchange'];
            } else {
                rate = (response['data']['exchange']).toFixed(2);
            };
        
            $('#exchange1').empty().append(rest['currencies'][0]['name']);
            var pub = '1.00 ' + homeCurrency + ' : ' + rest['currencies'][0]['symbol'] + rate;
            $('#exchange2').empty().append(pub);
            $('#exchange3').empty().append(rest['currencies'][0]['code']);
            $('#exchange4').empty().append(rest['currencies'][0]['symbol']);
            
            $('#weather1').empty().append('<img id="mainWeathIcon" src="https://openweathermap.org/img/wn/' + response['data']['forecast']['daily'][0]['weather'][0]['icon'] + '@2x.png"></img>');
            $('#weather2').empty().append(response['data']['forecast']['daily'][0]['weather'][0]['main']);
            $('#weather3').empty().append(capitalizeFirstLetter(response['data']['forecast']['daily'][0]['weather'][0]['description']));
            $('#weather4').empty().append(response['data']['forecast']['daily'][0]['clouds'] + '%');
            $('#weather5').empty().append((response['data']['forecast']['daily'][0]['temp']['morn'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather6').empty().append((response['data']['forecast']['daily'][0]['feels_like']['day'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather7').empty().append((response['data']['forecast']['daily'][0]['temp']['max'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather8').empty().append((response['data']['forecast']['daily'][0]['temp']['min'] - 273.15).toFixed(1) + '&#8451;');
            $('#weather9').empty().append(response['data']['forecast']['daily'][0]['pressure'] + ' mbar');
            $('#weather10').empty().append(response['data']['forecast']['daily'][0]['humidity'] + '%');
            $('#weather11').empty().append(response['data']['forecast']['daily'][0]['wind_speed'] + 'm/s');
            $('#weather12').empty().append(response['data']['forecast']['daily'][0]['wind_deg'] + '\u00B0');
            $('#weather13').empty().append(timestamp(response['data']['forecast']['daily'][0]['sunrise']));
            $('#weather14').empty().append(timestamp(response['data']['forecast']['daily'][0]['sunset']));
   
        },

        error: function(jqXHR, exception) {
            errorajx(jqXHR, exception);
            console.log("Data error");
        }
    });
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
            onClick: function modal(){
    
                switch(name) {
                    case 'Weather':
                        $('#weather-modal').modal('show');
                        break;
                    case 'Currency':
                        $('#exchange-modal').modal('show');
                        break;
                      
                  };
            }
          }
        ]
    }).addTo(mymap);
};

weatherEasy = new easyButton('Weather', '&#x1F326');
weatherEasy = new easyButton('Currency', '&#128181');
