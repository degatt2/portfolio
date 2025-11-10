var AppCore = {
	
	ppi: null,
	credentials: null,
	platform: null,
	service: null,

	setup: function ( credentials ) {
		console.log("Initializing App Core");
		this.ppi = this.getPixelDensity();
		this.credentials = credentials;
		this.platform = new H.service.Platform($.extend({useCIT: false, useHTTPS: true}, AppCore.credentials));
		this.service = this.platform.configure( new H.datalens.Service() );
	},
	
	getPixelDensity: function () {
		var hidpi = ("devicePixelRatio" in window && devicePixelRatio > 1); // Check whether the environment should use hi-res maps
	  	return hidpi ? 2 : 1;
	}

}