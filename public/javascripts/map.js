var maps_loaded=false
function map_finished_loading() {
  maps_loaded=true
}

(function($) {
  var mp=null
  var map=null
  var geocoder=null
  var onclose=null

  $.map_load = function() {
    if(maps_loaded) return
    var script = document.createElement("script")
    script.setAttribute("src","http://maps.google.com/maps?file=api&v=2.x&key=XXX&c&async=2&callback=map_finished_loading")
    script.setAttribute("type", "text/javascript")
    document.documentElement.firstChild.appendChild(script)
  }

  $.map_autoload = function() {
    setTimeout($.map_load,2000)
  }

  var get_info = function(lat,lng,addr) {
    lat=lat.toFixed(4)
    lng=lng.toFixed(4)
    var info = $("<div>").addClass('mapinfo')
    $('<div>').addClass('title').html(addr).appendTo(info)
    $('<div>').addClass('coord').
      html('['+lat+', '+lng+']').appendTo(info)
    $('<button>').html('use this').click(function() {
      map.closeInfoWindow()
      $.map_hide()
      onclose && onclose(lat,lng)
    }).appendTo(info)
    return info[0]
  }

  var get_address = function(point,func) {
    geocoder.getLocations(point, function(addresses) {
      var addr='(address not found)'
      if(addresses.Status.code == 200)
        addr = addresses.Placemark[0].address
      func(addr)
    })
  }

  var new_point = function(lat,lng) {
    var marker=new GMarker(new GLatLng(lat,lng),{ draggable: true })
    GEvent.addListener(marker, "click", function() {
      var point=marker.getLatLng()
      get_address(point,function(addr) {
        marker.openInfoWindow(get_info(point.lat(),point.lng(),addr))
      })
    })
    map.addOverlay(marker)
    return marker
  }

  $.map_show = function(cl,lat,lng) {
    if(!maps_loaded) {
      $.error('no support for google maps at the moment')
      return
    }
    try {
      if(!GBrowserIsCompatible()) {
        throw 1
      }
    } catch(e) {
      $.error('no support for google maps at the moment')
      return
    }

    onclose=cl
    $(document).bind('keyup', 'esc', function() {
      onclose && onclose()
      $.map_hide()
    })

    mp=$('#map-parent')
    if(mp.length==0) {
      mp=$('<div>').attr('id','map-parent').appendTo('body')
      $('<div>').attr('id','map').appendTo(mp)
      $(window).unload(function() { GUnload() })
      mp.show()
      map = new GMap2($('#map')[0])
      geocoder = new GClientGeocoder()
      map.addControl(new GLargeMapControl())
      map.addControl(new GMapTypeControl())
      map.enableScrollWheelZoom()
      map.setCenter(new GLatLng(41.39162014823012,2.16705322265625), 13)
      GEvent.addListener(map, "click", function(overlay,point) {
        if(point==null) return
        var marker=new_point(point.lat(),point.lng())
        GEvent.trigger(marker,'click')
      })
    }

    map.clearOverlays()
    if(lat) {
      var marker=new_point(lat,lng)
      map.setCenter(marker.getLatLng(), 13)
    }
    mp.show()
  }

  $.map_hide = function() {
    if(mp == null) return
    mp.hide()
    mp=null
    $(document).unbind('keyup', 'esc')
  }
})(jQuery)
