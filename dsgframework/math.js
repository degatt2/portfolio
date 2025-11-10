var MathUtilities = {
	
  // Map values: From processing.org
	mapValues: function (value, start1, stop1, start2, stop2, isClamp ) {
  	// return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    var clamped_value = isClamp? this.clampValues(value, start1, stop1 ) : value; 
    return start2 + (stop2 - start2) * ((clamped_value - start1) / (stop1 - start1));
	},

  clampValues: function ( value, min, high ) {
    return Math.max(min, Math.min(high, value));
  },

  // Converts from degrees to radians.
  radians: function(degrees) {
    return degrees * Math.PI / 180;
  },
 
  // Converts from radians to degrees.
  degrees: function(radians) {
    return radians * 180 / Math.PI;
  },

  distance: function ( p1, p2 ) {
    return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x)  + (p2.y - p1.y) * (p2.y - p1.y));
  },

  degreesToRadians: function (degrees) {  
    return degrees * (Math.PI/180);  
  },

  radiansToDegrees: function ( radians ) {
    return radians * (180/Math.PI);
  },

  angleBetweenPoints: function ( p1, p2 ) {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
  },

  angleBetweenCoords: function ( p1, p2 ) {
    return Math.atan2(p2.lng - p1.lng, p2.lat - p1.lat);
  },

  displayShorterNumbers: function ( number ) {

    var raw_number = number;
    var tmp_number = number > 1000? (number / 1000).toFixed(1) : number;
    var numeral = "";
    if (raw_number > 1000) numeral = "k";
    if (raw_number > 1000000) numeral = "m";
    if (raw_number > 1000000000) numeral = "b";
    if (raw_number > 1000000000000) numeral = "t";

    // number = Math.round(number);
    var label = String( tmp_number );

    if ( label.split('.').length > 1 ) label = label.split('.')[0];
    label += numeral;

    return label;

  },

  // Calculate distance between coordinates
  distanceBetweenCoordinates: function ( coord1, coord2 ) {

    var R = 6371; // km
    var l1 = this.degreesToRadians(coord1.latitude );
    var l2 = this.degreesToRadians(coord2.latitude );
    var a1 = this.degreesToRadians(coord2.latitude - coord1.latitude );
    var a2 = this.degreesToRadians(coord2.longitude - coord1.longitude );

    var a = Math.sin(a1/2) * Math.sin(a1/2) +
            Math.cos(l1) * Math.cos(l2) *
            Math.sin(a2/2) * Math.sin(a2/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  },

  // This run trought an array and returns the nearest coordinates
  getNearestPoint: function ( coord, data ) {

    var min_dist = 99999999999999;
    var min_value_index = 0.0;

    for ( var i = 0; i < data.length; i++ ) {
      var tmp_dist = this.distanceBetweenCoordinates( coord.Latitude, coord.Longitude, data[i][0], data[i][1] );
      if (tmp_dist < min_dist && tmp_dist > 0.0) {
        min_dist = tmp_dist;
        min_value_index = i;
      }
    }
    return { Latitude: data[min_value_index][0], Longitude: data[min_value_index][1] };
  },


  lerp: function (value1, value2, amt) {
    return ((value2 - value1) * amt) + value1;
  },

  lerpColor: function ( color1, color2, amt ) {

    var currentColor = chroma(color1)._rgb;
    var targetColor = chroma(color2)._rgb;

    currentColor[0] = Math.round(this.lerp(currentColor[0], targetColor[0], amt));
    currentColor[1] = Math.round(this.lerp(currentColor[1], targetColor[1], amt));
    currentColor[2] = Math.round(this.lerp(currentColor[2], targetColor[2], amt));
    currentColor[3] = 0.05;

    var c = chroma(currentColor).rgba();
    var tmpRGBAColor = 'rgba('+ c[0]+','+c[1]+','+c[2]+','+1+')' ;
    return tmpRGBAColor;

  },

  lerpColors: function ( colors, amt ) {

    var breaksCount = colors.length - 1;
    var bucketSize = 1 / breaksCount;
    var currentBucket = Math.floor( amt * breaksCount );

    var maped_amt = this.mapValues( amt, currentBucket / breaksCount, ( (currentBucket + 1) / breaksCount ), 0, 1 );

    var currentColor = chroma(colors[currentBucket])._rgb;
    var targetColor = chroma(colors[currentBucket + 1])._rgb;

    currentColor[0] = Math.round(this.lerp(currentColor[0], targetColor[0], maped_amt ));
    currentColor[1] = Math.round(this.lerp(currentColor[1], targetColor[1], maped_amt ));
    currentColor[2] = Math.round(this.lerp(currentColor[2], targetColor[2], maped_amt ));
    currentColor[3] = 1;

    var c = currentColor;
    var tmpRGBAColor = 'rgba('+ c[0]+','+c[1]+','+c[2]+','+1+')';
    return tmpRGBAColor;

  },


  // GEO LOCATION UTILTITIES ****** 
  
  // This function returns the coordinate
  // conversion string in DD to DMS.
  ddToDms: function (lat, lng) {

     var lat = lat;
     var lng = lng;
     var latResult, lngResult, dmsResult;

     // Make sure that you are working with numbers.
     // This is important in case you are working with values
     // from input text in HTML.
     lat = parseFloat(lat);  
     lng = parseFloat(lng);

     // Check the correspondence of the coordinates for latitude: North or South.
     latResult = (lat >= 0)? 'N' : 'S';

     // Call to getDms(lat) function for the coordinates of Latitude in DMS.
     // The result is stored in latResult variable.
     latResult += getDms(lat);

     // Check the correspondence of the coordinates for longitude: East or West.
     lngResult = (lng >= 0)? 'E' : 'W';

     // Call to getDms(lng) function for the coordinates of Longitude in DMS.
     // The result is stored in lngResult variable.
     lngResult += getDms(lng);

     // Joining both variables and separate them with a space.
     dmsResult = latResult + ' ' + lngResult;

     // Return the resultant string.
     return dmsResult;
  },

  // Function that converts DMS to DD.
  // Taking as example the value -40.601203.
  getDms: function (val) {

     // Required variables
     var valDeg, valMin, valSec, result;

     // Here you'll convert the value received in the parameter to an absolute value.
     // Conversion of negative to positive.
     // In this step does not matter if it's North, South, East or West,
     // such verification was performed earlier.
     val = Math.abs(val); // -40.601203 = 40.601203

     // ---- Degrees ----
     // Stores the integer of DD for the Degrees value in DMS
     valDeg = Math.floor(val); // 40.601203 = 40

     // Add the degrees value to the result by adding the degrees symbol "º".
     result = valDeg + "º"; // 40º

     // ---- Minutes ----
     // Removing the integer of the inicial value you get the decimal portion.
     // Multiply the decimal portion by 60.
     // Math.floor returns an integer discarding the decimal portion.
     // ((40.601203 - 40 = 0.601203) * 60 = 36.07218) = 36
     valMin = Math.floor((val - valDeg) * 60); // 36.07218 = 36

     // Add minutes to the result, adding the symbol minutes "'".
     result += valMin + "'"; // 40º36'

     // ---- Seconds ----
     // To get the value in seconds is required:
     // 1º - removing the degree value to the initial value: 40 - 40.601203 = 0.601203;
     // 2º - convert the value minutes (36') in decimal ( valMin/60 = 0.6) so
     // you can subtract the previous value: 0.601203 - 0.6 = 0.001203;
     // 3º - now that you have the seconds value in decimal,
     // you need to convert it into seconds of degree.
     // To do so multiply this value (0.001203) by 3600, which is
     // the number of seconds in a degree.
     // You get 0.001203 * 3600 = 4.3308
     // As you are using the function Math.round(),
     // which rounds a value to the next unit,
     // you can control the number of decimal places
     // by multiplying by 1000 before Math.round
     // and subsequent division by 1000 after Math.round function.
     // You get 4.3308 * 1000 = 4330.8 -> Math.round = 4331 -> 4331 / 1000 = 4.331
     // In this case the final value will have three decimal places.
     // If you only want two decimal places
     // just replace the value 1000 by 100.
     valSec = Math.round((val - valDeg - valMin / 60) * 3600 * 1000) / 1000; // 40.601203 = 4.331 

     // Add the seconds value to the result,
     // adding the seconds symbol " " ".
     result += valSec + '"'; // 40º36'4.331"

     // Returns the resulting string.
     return result;
   },

   interpolate: function( origin, dest, f ) {

    if (origin.lat === dest.lat && origin.lng === dest.lng ) 
      return new H.geo.Point( origin.lat, origin.lng );
    
    var deg2rad = Math.PI / 180.0,
        lat1 = origin.lat * deg2rad,
        lon1 = origin.lng * deg2rad,
        lat2 = dest.lat * deg2rad,
        lon2 = dest.lng * deg2rad;

    var d = 2 * Math.asin(
        Math.sqrt(
          Math.pow(Math.sin((lat1 - lat2) * 0.5), 2) +
          Math.cos(lat1) * Math.cos(lat2) *
          Math.pow(Math.sin((lon1 - lon2) * 0.5), 2)));

    var A = Math.sin((1-f)*d)/Math.sin(d);
    var B = Math.sin(f*d)/Math.sin(d);
    var x = A * Math.cos(lat1) * Math.cos(lon1) + B * Math.cos(lat2) * Math.cos(lon2);
    var y = A * Math.cos(lat1) * Math.sin(lon1) + B * Math.cos(lat2) * Math.sin(lon2);
    var z = A * Math.sin(lat1) + B * Math.sin(lat2);

    var latN = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)));
    var lonN = Math.atan2(y,x);

    return new H.geo.Point(latN / deg2rad, lonN / deg2rad);
  }

}