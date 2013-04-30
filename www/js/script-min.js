var vpmobile = {
  getUserLocation: function() {
    // get the user's GPS location from an HTML5 browser
    if (navigator.geolocation) {

      navigator.geolocation.getCurrentPosition(vpmobile.updateUserLocation);
    }
  },
  updateUserLocation: function(position) {
    // call itself in 1 second
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

    usermarkerimage = {
      url:'images/user-location.png',
      scaledSize: new google.maps.Size(50, 50)
    };

    if (vpmobile.userLocationMarker) {
      vpmobile.userLocationMarker.setMap(null);
    }
    vpmobile.userLocationMarker = new google.maps.Marker({
      position: latlng,
      map: vpmobile.map,
      'icon' : usermarkerimage,
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
    });
    vpmobile.bounds.extend(latlng);

    vpmobile.map.fitBounds(vpmobile.bounds);

    setTimeout(function(){vpmobile.getUserLocation()}, 60000);
  },
  initialize: function() {
    // the bounds to control the map by

    //vpmobile.hasbeenpaned = false;

    var mapOptions = {
      zoom: 16,
      center: new google.maps.LatLng(51.041499,-114.063690),
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: true,
      zoomControl:true,
    };
    vpmobile.map = new google.maps.Map(document.getElementById('map_canvas'),
        mapOptions);

    infobox = new InfoBox({
        alignBottom: true,
         content: document.getElementById("infobox"),
         disableAutoPan: false,
         maxWidth: 150,
         pixelOffset: new google.maps.Size(-150, 0),
         zIndex: null,
         boxStyle: {
            //background: "url('images/map-detail-bg@2x.png') no-repeat 0 0",
            width: "300px",
            height:"170px",
            margin:"0 0 40px 0"
        },
        pane: "floatPane",
        closeBoxURL: "images/close.png",
        infoBoxClearance: new google.maps.Size(1, 1),
        enableEventPropagation: true
    });

    // initialize the geolocation feature
    vpmobile.getUserLocation();
  },
  addMarker: function(location) {
    marker = new google.maps.Marker({
      position: location,
      map: vpmobile.map
    });

    google.maps.event.addListener(marker, 'click', function() {
      console.log('clieck');
    });
    vpmobile.markers.push(marker);
  },

  setAllMap: function(map) {
    for (var i = 0; i < vpmobile.markers.length; i++) {
      vpmobile.markers[i].setMap(map);
    }
  },

  searchListings: function(){
    var thedata = vpmobile.nodes;
    $.each( thedata, function(i, node) {
      //console.log(i);
      //console.log(node.listing);
      listing_html = '<li data-icon="false" class="'+ node.listing.term +'"><a href="detail.html?path='+ node.listing.path +'" class="list-item-link"><h2>'+ node.listing.title +'</h2><p class="phone">'+ node.listing.phone +'</p></a>';
      listing_html += '<span style="display:none;">'+node.listing.body + '</span></li>';

      $('#search-list').append(listing_html);

    });

    var searchq = getURLParameter('q');
    //console.log(searchq);
    if (searchq !== "null") {
      //$('#search-input-page').val( decodeURIComponent(searchq).replace(/\+/g, ' '));
      $('.ui-input-search input').val(decodeURIComponent(getURLParameter('q')).replace(/\+/g, ' '));
      $('.ui-input-search input').trigger('change');
    }
    $("#search-list").listview("refresh");
  },

  loadNodes: function(callbackfunction, optional_argument) {

    if (vpmobile.nodes === undefined || vpmobile.nodes.length < 1){
        $.getJSON( 'export.json', function(data) {
          //console.log('getting data!');
          vpmobile.nodes = data.nodes;
          callbackfunction(optional_argument);
          //console.log(vpmobile.nodes);
        });
      } else {
        //console.log('already loaded!');
        callbackfunction(optional_argument);
      }
  },

  loadMarkers: function() {
    var markerimage = new Array();

    if (getURLParameter('term') != 'null') {
      var thedata = vpmobile.nodes.filter(function (el) {
        //console.log(el);
        return el.listing.term == getURLParameter('term').replace("''","&#039;");
      });
    } else if (vpmobile.active_category !== undefined) {
      console.log(vpmobile.active_category);
      var thedata = vpmobile.nodes.filter(function (el) {
        //console.log(el);
        return el.listing.term == vpmobile.active_category.replace("''","&#039;");
      });
    } else {
      var thedata = vpmobile.nodes;
    }

    // clear current markers
    //console.log('clearing markers');
    //vpmobile.markers = [];
    //vpmobile.setAllMap(null);

    //console.log(thedata);
    $.each( thedata, function(i, marker) {

      //console.log(marker.listing);

      // Marker image from category

      switch(marker.listing.term)
      {
      case 'Cafe and Dining':
        markerimage[i] = {
          url:'images/map-pin-cafe@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Pubs &#039;n Clubs':
        markerimage[i] = {
          url:'images/map-pin-pubs@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Shop':
        markerimage[i] = {
          url:'images/map-pin-shops@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Stay &#039;n Play':
        markerimage[i] = {
          url:'images/map-pin-stay@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Treats':
        markerimage[i] = {
          url:'images/map-pin-treats@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      case 'Events':
        markerimage[i] = {
          url:'images/map-pin-special@2x.png',
          scaledSize: new google.maps.Size(45, 60)
        };
        break;
      }
      //console.log(markerimage[i]);

      // add the marker with the image and the click function
      //vpmobile.addMarker(new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude));
      var markerPosition = new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude);
      markerobj = new google.maps.Marker({
        position: markerPosition,
        map: vpmobile.map,
        'icon' : markerimage[i]
      });
      vpmobile.bounds.extend(markerPosition);

      google.maps.event.addListener(markerobj, 'click', function() {
        //console.log(marker.listing);
        //console.log($('#infobox h4').html());
        /*$('#infobox h4').html(marker.listing.title);
        $('#infobox').attr('class', marker.listing.term);
        $('#infobox phone').html(marker.listing.phone);
        $('#infobox .path').html(marker.listing.path);*/
        //console.log($('#infobox h4').html());

        infobox.setContent('<div id="infobox" class="'+marker.listing.term+'">'+
            '<h4>'+marker.listing.title+'</h4>'+
            '<phone>'+marker.listing.phone+'</phone>'+
            '<p class="path">'+marker.listing.path+'</p>'+
        '</div>');
        infobox.open(vpmobile.map, this);

      });
      //vpmobile.markers.push(markerobj);
      oldCenter = vpmobile.map.getCenter();
      google.maps.event.trigger(vpmobile.map, 'resize');
      vpmobile.map.setCenter(oldCenter);


        /*$('#map_canvas').gmap('addMarker', {
          'position': new google.maps.LatLng(marker.listing.latitude, marker.listing.longitude),
          'icon' : markerimage[i]
        }).click(function() {
          //$('#map_canvas').gmap('openInfoWindow', { 'content': marker.listing.title }, this);
          //console.log(infobox.content);

          // set the marker content
          $('#infobox h4').html(marker.listing.title);
          $('#infobox phone').html(marker.listing.phone);
          $('#infobox .path').html(marker.listing.path);
          infobox.open(map, this);

          //console.log(infobox);

        });*/
    });

    //vpmobile.map.fitBounds(vpmobile.bounds);
  },


}

// map page
$('#map').live('pageinit', function() {
  console.log('#map pageinit');
  $('#infobox').live('tap', function(e) {
    //console.log($(this).find('.path').html());
    vpmobile.active_listing = $(this).find('.path').html();
    $.mobile.changePage("detail.html?path="+$(this).find('.path').html(), {reloadPage:true});
    return false;
  });
  vpmobile.bounds = new google.maps.LatLngBounds();
  vpmobile.initialize();
});


$('#map').live('pageshow', function() {
  console.log('#map pageshow');
  //$('#map_canvas').gmap('refresh');
  vpmobile.loadNodes(vpmobile.loadMarkers);
  //$.mobile.showPageLoadingMsg();
  //$.mobile.hidePageLoadingMsg();
});


// search page functionality
$('#search').live('pageinit', function() {
  console.log('#search pageinit');
  vpmobile.loadNodes(vpmobile.searchListings);
});


$(document).live("pageinit", function(){
  $.extend(  $.mobile , {
    ajaxEnabled: false
  });
});

$(function() {
});


/* **********************************************
     Begin main_script.js
********************************************** */

vpmobile.loadListings = function() {

    $.each( vpmobile.nodes, function(i, marker) {
      //console.log(i);
      //console.log(marker.listing);
      listing_html = '<li data-icon="false"><a href="detail.html?path='+ marker.listing.path +'" class="list-item-link"><h2>'+ marker.listing.title +'</h2><p class="phone">'+ marker.listing.phone +'</p></a></li>';

      switch(marker.listing.term)
      {
      case 'Cafe and Dining':
        $('#list1').append(listing_html);
        break;
      case 'Pubs &#039;n Clubs':
        $('#list2').append(listing_html);
        break;
      case 'Shop':
        $('#list3').append(listing_html);
        break;
      case 'Stay &#039;n Play':
        $('#list4').append(listing_html);
        break;
      case 'Treats':
        $('#list5').append(listing_html);
        break;
      case 'Events':
        $('#list6').append(listing_html);
        break;
      }

    });
    $("#list1").listview("refresh");
    $("#list2").listview("refresh");
    $("#list3").listview("refresh");
    $("#list4").listview("refresh");
    $("#list5").listview("refresh");
    $("#list6").listview("refresh");
  };

vpmobile.getDetailedListing = function(path) {
    //console.log(path);
    if (path == 'null') {
      //console.log(vpmobile.active_listing);
      path = vpmobile.active_listing;
    }
    var thedata = vpmobile.nodes.filter(function (el) {
      //console.log(el);
      return el.listing.path == path;
    });
    //console.log(vpmobile.nodes);
    thedata = thedata[0].listing;
    $('.innertext h2').html(thedata.title);
    $('.innertext h2').attr('class', thedata.term);
    $('.innertext .address').html(thedata.street);
    $('.innertext phone').html(thedata.phone);
    if (thedata.body != '') {
      $('.innertext .description').html(thedata.body);
      $('.innertext .description').show();
      $('.innertext h3').show();
    } else {
      $('.innertext h3').hide();
      $('.innertext .description').hide();
    }

    $('.detail_image').attr('src', thedata.thumbnail);



    vpmobile.currentListing = thedata;

    vpmobile.initializeMap(vpmobile.currentListing.latitude, vpmobile.currentListing.longitude, vpmobile.currentListing.term);
    console.log(thedata);
};

$('#main').live('pageshow', function() {
  console.log('#main pageshow');
  //$('#map_canvas').gmap('refresh');
});

vpmobile.initializeMap = function (lat, long, term) {
  var mapOptions = {
    center: new google.maps.LatLng(lat, long),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    disableDefaultUI: true
  };

  var map = new google.maps.Map(document.getElementById("map-canvas"),
      mapOptions);
  switch(term)
  {
  case 'Cafe and Dining':
    markerimage = {
      url:'images/map-pin-cafe@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Pubs &#039;n Clubs':
    markerimage = {
      url:'images/map-pin-pubs@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Shop':
    markerimage = {
      url:'images/map-pin-shops@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Stay &#039;n Play':
    markerimage = {
      url:'images/map-pin-stay@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Treats':
    markerimage = {
      url:'images/map-pin-treats@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  case 'Events':
    markerimage = {
      url:'images/map-pin-special@2x.png',
      scaledSize: new google.maps.Size(60, 80)
    };
    break;
  }

  markerobj = new google.maps.Marker({
    position: new google.maps.LatLng(lat, long),
    map: map,
    'icon' : markerimage
  });

  vpmobile.detailMap = map;

  $('#map-canvas').toggle();
}


$('#details').live('pageinit', function() {
  vpmobile.loadNodes(vpmobile.getDetailedListing, getURLParameter('path'));
  $('.view_on_map').click(function(){
    console.log('clicked');
    $('#map-canvas').toggle();
    google.maps.event.trigger(vpmobile.detailMap, 'resize');
    vpmobile.detailMap.setCenter(new google.maps.LatLng(vpmobile.currentListing.latitude, vpmobile.currentListing.longitude));
    smart_scroll($('#map-canvas'));
  });
});

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search)||[,null])[1]
    );
}


// click on link in the list, set the active listing variable
$('.list-item-link').live('click',function(){
  path = decodeURI(
    (RegExp(name + '=' + '(.+?)(&|$)').exec($(this).attr('href'))||[,null])[1]
  );
  vpmobile.active_listing = path;
});

$("div.ui-collapsible").live("expand", function(e) {
  smart_scroll(e.target);
});

// explore page, load the listings into the lists
$('#main').live('pageinit', function() {
  vpmobile.loadNodes(vpmobile.loadListings);
  $("a.header-link").live("click", function (e) {

    console.log($(this)[0].dataset.link);

    vpmobile.active_category = $(this)[0].dataset.link;
    $.mobile.changePage('index.html', {reloadPage:true});//
    return false;

  });
});



function smart_scroll(el, offset)
{
  offset = offset || 0; // manual correction, if other elem (eg. a header above) should also be visible

  var air         = 15; // above+below space so element is not tucked to the screen edge

  var el_height   = $(el).height()+ 2 * air + offset;
  var el_pos      = $(el).offset();
  var el_pos_top  = el_pos.top - air - offset;

  var vport_height = $(window).height();
  var win_top      = $(window).scrollTop();

  //  alert("el_pos_top:"+el_pos_top+"  el_height:"+el_height+"win_top:"+win_top+"  vport_height:"+vport_height);

  var hidden = (el_pos_top + el_height) - (win_top + vport_height);

  if ( hidden > 0 ) // element not fully visible
      {
      var scroll;

      if(el_height > vport_height) scroll = el_pos_top;       // larger than viewport - scroll to top
      else                         scroll = win_top + hidden; // smaller than vieport - scroll minimally but fully into view

      $('html, body').animate({ scrollTop: (scroll) }, 200);
      }

}