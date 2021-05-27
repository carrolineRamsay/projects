
$(window).on('load', function(){
    if($('#preloader').length){
        $('#preloader').delay(100).fadeOut('slow', function(){
            $(this).remove();
        });
    }
});

$('#timezoneBtn').click(function() {

    $.ajax({
        url: "libs/php/timezoneInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#selTimezoneLat').val(),
            lng: $('#selTimezoneLng').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));

            if(result.status.name == "ok") {

                $('#timezoneResult').html(result['data']['timezoneId']);
                $('#timezoneTimeResult').html(result['data']['time']);

            }       
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
			
            console.log("Error found");
        }
    }); 
});

$('#oceanBtn').click(function() {

    $.ajax({
        url: "libs/php/oceanInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#selOceanLat').val(),
            lng: $('#selOceanLng').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));

            if(result.status.name == "ok") {

                $('#oceanResult').html(result['data']['name']);
                

            }       
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
			
            console.log("Error found");
        }
    }); 
});

$('#neighbourBtn').click(function() {

    $.ajax({
        url: "libs/php/neighbourhoodInfo.php",
        type: 'POST',
        dataType: 'json',
        data: {
            lat: $('#selNeighbourLat').val(),
            lng: $('#selNeighbourLng').val()
        },
        success: function(result) {
            console.log(JSON.stringify(result));

            if(result.status.name == "ok") {

                $('#neighbourResult').html(result['data']['city']);
                $('#neighbourCityResult').html(result['data']['name']);
                
            }  
            
            else if(result['data'] == []) {
                return null;
                
                } 
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
			
            console.log("Error found");
        }
    }); 
});