var map;
var centerMark = {
    lat: 24.803049,
    lng: 120.972016
};
var lastWindow=null;

var directionsDisplay;
var directionsService;
var oldDirections = [];
var currentDirections = null;

//初始化地圖
function initMap() {
    //載入規劃路徑Service
    directionsService = new google.maps.DirectionsService();

    //取得目前位置-預設新竹火車站
    //Getposition();

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: centerMark,
        mapTypeId: 'terrain',
        streetViewControl: false,
        scaleControl: true,
        minZoom: 13,
        mapTypeControl: false,
        mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
        }
    });

    var nowmarker = new google.maps.Marker({
        position: centerMark,
        map: map,
        title: '現在位置'
    });

    var contentString = '<h2 style="font-family:微軟正黑體;">目前位置</h2>';
    var nowinfowindow = new google.maps.InfoWindow({
        content: contentString
    });

    nowmarker.addListener('click', function(e) {
        console.log('now',e)
        nowinfowindow.open(map, nowmarker);
    });


    //取得站點資料   
    $.get('http://opendata.hccg.gov.tw/dataset/1f334249-9b55-4c42-aec1-5a8a8b5e07ca/resource/4d5edb22-a15e-4097-8635-8e32f7db601a/download/20180212143756340.json', function(stationRecord){
        console.log(stationRecord)
        setMarkers(map, stationRecord);
    });  

    //路徑規劃
    directionsDisplay = new google.maps.DirectionsRenderer({
        'map': map,
        'preserveViewport': true,
        'draggable': true
    });	
	
    directionsDisplay.setPanel(document.getElementById("directions_panel"));

    google.maps.event.addListener(directionsDisplay, 'directions_changed',
      function() {
        if (currentDirections) {
          oldDirections.push(currentDirections);          
        }
        currentDirections = directionsDisplay.getDirections();
    });
}

//取得目前位置
function Getposition() {
    $.post("https://www.googleapis.com/geolocation/v1/geolocate?key=AIzaSyDIHHXeYB_Hsf21AAaQX8qd5Y2NDsckUbI", function(data, status){
        centerMark.lat = data.location.lat;
        centerMark.lng = data.location.lng;
        console.log(centerMark);
    });
}

//點位
function setMarkers(map, locations){
    var marker, i;
    for(i=0; i<locations.length; i++){
        var loan = locations[i]['站點名稱']
        var lat = parseFloat(locations[i]['緯度'])
        var long = parseFloat(locations[i]['經度'])
        var add =  locations[i]['站點位置']

        latlngset = new google.maps.LatLng(lat, long);

        var marker = new google.maps.Marker({  
          map: map, title: loan , position: latlngset , icon: 'image/icon.png'
        });

        var content = "<h3>站點名稱: " + loan +  '</h3>' + "站點位置: " + add + "<br><br><button onclick=" + "calcRoute('" + loan + "')"+ ">規劃路徑</button>"    
        var infowindow = new google.maps.InfoWindow()

        google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
            return function() {
                infowindow.setContent(content); //放入iffo文字
                if (lastWindow) lastWindow.close(); //其餘info關閉
                infowindow.open(map, marker); //新的info打開
                lastWindow=infowindow;
            };
        })(marker,content,infowindow)); 
  }
}

//設定路徑
function calcRoute(pEnd) {
	var start = centerMark;
	var end = pEnd;
    var request = {
        origin:start,		//起始地
        destination: "新竹市" + end,	//目的地
        travelMode: google.maps.DirectionsTravelMode.WALKING //旅行工具 WALKING | DRIVING
    };
    directionsService.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directionsDisplay.setDirections(response);
      }
    });
		
}