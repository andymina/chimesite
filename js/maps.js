window.onload = () => { init(); };

let geoLocationOptions = {
  enableHighAccuracy: true
};

initAlarm = () => {
  window.alarm = new Audio("alarm1.mp3");
  window.alarm.play();
  window.alarm.volume = 0;
  window.alarm.loop = true;
}

init = () => {
  if (navigator.geolocation) {
    window.reached = false;
    window.changeDestination = false;
    $("#map-header").text("");
    navigator.geolocation.getCurrentPosition(pos => {
      pos = [pos.coords.latitude, pos.coords.longitude];
      window.map = L.map('map', {
        attributionControl: false
      }).setView(pos, 18);
      window.map.on('click', onMapClick);
      window.markers = L.featureGroup();
      window.origin = L.marker(pos);
      window.origin.addTo(window.map);
      window.markers.addLayer(window.origin);
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1Ijoic3BlbGxldyIsImEiOiJjamNqdW5iazgzazI0MndudGh6NjVqM2xrIn0.VML7TdhGwdJlFXauBgwheQ'
      }).addTo(window.map);
      $("#destination").addClass("visible");
      $("#use form")[0].reset();
      $("body").on("click", "#destination-marker button", () => {
        window.changeDestination = !window.changeDestination;
        if (window.changeDestination) {
          $("#map-header").text("Please Click Destination on Map.");
        } else {
          $("#map-header").text("");
        }
      });
      $("#destination-submit").click((evt) => {
        evt.preventDefault();
        if (!window.reached) {
          initAlarm();
          handleAddressSubmit($("#destination-search").val());
        }
      });
      $("#destination-control").click((evt) => {
        evt.preventDefault();
        if (window.reached) {
          window.alarm.volume = 0;
          window.reached = false;
          $("#destination").addClass("visible");
          $("#destination-control").removeClass("visible");
          $("#use form")[0].reset();
          window.map.removeLayer(window.destination);
          window.markers.removeLayer(window.destination);
          window.destination = null;
        }
      });
      navigator.geolocation.watchPosition((pos) => {
        pos = [pos.coords.latitude, pos.coords.longitude];
        if (window.origin) {
          window.map.removeLayer(window.origin);
          window.markers.removeLayer(window.origin);
        }
        window.origin = L.marker(pos);
        window.origin.addTo(window.map);
        window.markers.addLayer(window.origin);
        checkDestination();
      }, null, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }, geoLocationFail, geoLocationOptions);
    }, geoLocationFail, geoLocationOptions);
  } else {
    alert("Sorry your browser does not support this webapp.")
  }
};

addDestination = (lat, lng, radius) => {
  if (window.destination) {
    window.map.removeLayer(window.destination);
    window.markers.removeLayer(window.destination);
  }
  window.radius = Number($("#destination-radius").val() || 0.1) * 1609.34;
  window.destination = L.circle([lat, lng], {
    radius: (window.radius)
  });
  window.destination.bindPopup('<button class="btn btn-custom" type="button">Change Destination Location</button>').openPopup();
  window.destination.addTo(window.map);
  window.markers.addLayer(window.destination);
  window.map.fitBounds(window.markers.getBounds());
  checkDestination();
}

checkDestination = () => {
  if (window.destination && window.origin) {
    if (((L.latLng(window.origin._latlng).distanceTo(window.destination._latlng)) < window.radius) && !window.reached) {
      window.reached = true;
      window.alarm.volume = 1;
      $("#destination").removeClass("visible");
      $("#destination-control").addClass("visible");
    }
  }
}

handleAddressSubmit = (address) => {
  if (address) {
    const provider = new window.GeoSearch.GoogleProvider();
    provider.search({
        query: address.toLowerCase()
      })
      .then(res => {
        try {
          addDestination(res[0].y, res[0].x);
        } catch (e) {
          console.log("Error: ", e);
          alert("Something went wrong. Is your destination correct?");
        }
      });
  }
}

onMapClick = (e) => {
  if (window.changeDestination && !window.reached) {
    initAlarm();
    addDestination(e.latlng.lat, e.latlng.lng);
    window.changeDestination = false;
    $("#map-header").text("");
  }
}

geoLocationFail = (err) => {
  console.log(err.code, err.message);
}
