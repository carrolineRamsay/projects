let mymap = L.map('map').setView([0, 0], 1);
let border;
let marker;
let tooltip;
let weatherButton;
let ratesButton;
let dates = []
let times = []
let capitalMarker;
let popup;
let country;
let $rates;
$rates = $("#rates");



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(mymap);

weatherButton = L.easyButton('<i class="fas fa-cloud-sun"></i>', function () {
  $("#weathermodal").modal("show");
}, 'Latest Weather').addTo(mymap);

infoButton = L.easyButton('<i class="fas fa-info"></i>', function () {
  $("#infomodal").modal("show");
}, 'Country Information').addTo(mymap);

newsButton = L.easyButton('<i class="far fa-newspaper"></i>', function() {
  $('#newsmodal').modal("show");
},
  'Latest News').addTo(mymap)

ratesButton = L.easyButton('<i class="fas fa-dollar-sign"></i>', function() {
    $("#ratesmodal").modal("show");
  },
    'Exchange Rates').addTo(mymap)


let lat;
let lon;

navigator.geolocation.getCurrentPosition((position) => {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  mymap.setView([lat, lon], 7);
 
  $.ajax({
    url: "libs/php/latAndLng.php",
    type: 'POST',
    dataType: 'json',
    data: {
      lat: lat,
      lng: lng
    },
    success: function (result) {

      if (result.status.name == "ok") {

        $('#countries').val(result.data).change()    
        
      }
  
      
    },
    error: function (jqXHR, textStatus, errorThrown) {
    }
  })

});

