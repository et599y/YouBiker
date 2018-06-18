var map;
var centerMark = {
    lat: 24.803049,
    lng: 120.972016
};
var infowindow;
var content=[];
//標籤
var markers=[];
var lastWindow=null;
//站點資料
var Rdata;

var directionsDisplay;
var directionsService;
var oldDirections = [];
var currentDirections = null;

var language= "繁"; //預設繁體
var tagname={
    name: "站點名稱",
    location: "站點位置",
    btnname: "規劃路徑"
};


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
        Rdata = stationRecord;
        setMarkers(map, Rdata, tagname);
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
function setMarkers(map, locations, tagname){
    var i;
    for(i=0; i<locations.length; i++){
        var loan = locations[i]['站點名稱']
        var lat = parseFloat(locations[i]['緯度'])
        var long = parseFloat(locations[i]['經度'])
        var add =  locations[i]['站點位置']

        latlngset = new google.maps.LatLng(lat, long);
        content[i] = "<h3>" + tagname.name + ": " + loan +  '</h3>' + tagname.location + ": " + add + "<br><br><button onclick=" + "calcRoute('" + loan + "')"+ ">" + tagname.btnname + "</button>";

        var marker = new google.maps.Marker({  
          map: map, title: loan , position: latlngset , icon: 'image/icon.png', content: content[i]
        });

        markers.push(marker);

        
        infowindow = new google.maps.InfoWindow({
            content: content[i]
        });

        google.maps.event.addListener(marker,'click', (function(marker,content,infowindow){ 
            return function() {
                //infowindow.setContent(content); //放入iffo文字
                if (lastWindow) lastWindow.close(); //其餘info關閉
                infowindow.open(map, marker); //新的info打開
                lastWindow=infowindow;
            };
        })(marker,content[i],infowindow)); 
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

//清空標記
function setMapOnAll() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
        console.log("remove")
    }
    markers = [];
}


//多語系
function toChinese(){
    
    //繁轉簡
    if(language == "繁"){
        setMapOnAll();
        console.log(Rdata)
        for(var x=0;x<Rdata.length;x++){
            console.log(Rdata[x]['站點名稱']);
            (function(index){
                $.get("https://cors.io/?http://www.webxml.com.cn/WebServices/TraditionalSimplifiedWebService.asmx/toSimplifiedChinese?sText=" + Rdata[x]['站點名稱'], function(data){
                    
                    // console.log("data", $($.parseXML(data)).find("string").text());
                    Rdata[index]['站點名稱'] = $($.parseXML(data)).find("string").text();
                });

                $.get("https://cors.io/?http://www.webxml.com.cn/WebServices/TraditionalSimplifiedWebService.asmx/toSimplifiedChinese?sText=" + Rdata[x]['站點位置'], function(data){
                    // console.log("data2", $($.parseXML(data)).find("string").text());
                    Rdata[index]['站點位置'] = $($.parseXML(data)).find("string").text();
                });
            })(x);
        }    
        
        //設定
        setTimeout(
            function checkState(state){
                language = "簡";
                tagname.name = "站点名称";
                tagname.location = "站点位置";
                tagname.btnname = "规划路径";
                setMarkers(map, Rdata, tagname);
                // console.log("setmark")
            }, 25000
        );
    }
}

function toTaiwanese(){
    
    //簡轉繁
    if(language == "簡"){
        setMapOnAll();
        for(var x=0;x<Rdata.length;x++){
            console.log(Rdata[x]['站點名稱']);
            (function(index){
                $.get("https://cors.io/?http://www.webxml.com.cn/WebServices/TraditionalSimplifiedWebService.asmx/toTraditionalChinese?sText=" + Rdata[x]['站點名稱'], function(data){
                    
                    // console.log("data", $($.parseXML(data)).find("string").text());
                    Rdata[index]['站點名稱'] = $($.parseXML(data)).find("string").text();
                });

                $.get("https://cors.io/?http://www.webxml.com.cn/WebServices/TraditionalSimplifiedWebService.asmx/toTraditionalChinese?sText=" + Rdata[x]['站點位置'], function(data){
                    // console.log("data2", $($.parseXML(data)).find("string").text());
                    Rdata[index]['站點位置'] = $($.parseXML(data)).find("string").text();
                });
            })(x);
        }    
        
        //設定
        setTimeout(
            function checkState(state){
                language = "繁";
                tagname.name = "站點名稱";
                tagname.location = "站點位置";
                tagname.btnname = "規劃路徑";
                setMarkers(map, Rdata, tagname);
                // console.log("setmark")
            }, 25000
        );
    }
}

//搜尋站點
function searchmark(){
    var check = false;
    var s = $("#textboxClass").val();
    if(s == ""){
        alert("請輸入搜尋名稱");
    }
    else{
        for(var a=0;a<Rdata.length;a++){
            if(Rdata[a]['站點名稱'] == s){
                for(var m =0;m<markers.length;m++){
                    if(markers[m].title == Rdata[a]['站點名稱']){
                        console.log("center", Rdata[a]['站點名稱'])
                        console.log(markers)
                        var latLng = new google.maps.LatLng(Rdata[a]['緯度'], Rdata[a]['經度']);
                        map.setCenter(latLng);
                        infowindow.close(); //其餘info關閉
                        infowindow = new google.maps.InfoWindow({
                            content: markers[m].content
                        });
                        infowindow.open(map, markers[m]);
                    }
                }              
                check = true;
                break;
            }
        }
        if(check == false){
            alert("查無此結果");
        }
    }
    check = false;
}

