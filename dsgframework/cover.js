var Cover = {

  onlyChrome: true,
  isChrome:false,
  isBgBlur: true,
  animDuration: 500,
  
  title:"Add title",
  description:"Add description",
  credits: 'Story by Daniel González, 2016',
  btnLabel:"Explore",
  url: null,
  that:null,

  user_accepted_cookies: false,

  setup: function ( props ) {
    
    that = this;
    this.title = props.title? props.title : "This is a title";
    this.description = props.description? props.description : "This is a description";
    this.btnLabel = props.actionLabel? props.actionLabel : "Explore";
    this.url = props.url? props.url : window.location.href;

    var app = $(".app");
    app.addClass('blur')

    // Adding the title to the html page
    $('title').html(this.title);

    // COVER: Appending HTML
    $("body").prepend('<div class="cover"><div class="middle"><div class="brand"><div class="logo"></div><div class="present">The <span class="accent">Data Storytelling Group</span> present</div></div><div class="title bold"><span class="italic">'+ this.title +'</div><div class="description">'+this.description+'</div><div class="action-container"><div class="explore">'+this.btnLabel+'</div><div class="loading">Loading data</div><div class="chrome"><div class="warning"></div>This visualization is only available on <a href="https://www.google.com/chrome/browser/desktop/">Google Chrome</a>. Please, change your browser to continue.</div></div>' + '<div class="credits">' + this.credits + '</div>' + '</div></div>')
    
    app.prepend('<div class="back-to-cover fa-info"></div>');

    // Fullscreen menu
    if (screenfull.enabled) {
      app.prepend('<div class="fs fa-arrows-alt"></div>');
      var fs = $('.fs')
      fs.click(function (evt) {
        screenfull.toggle();
      })
    }
    
    this.onlyChrome = props.onlyChrome? props.onlyChrome : false; // Check if is google chrome only
    this.isChrome = this.isGoogleChrome();

    if( this.onlyChrome && !this.isChrome ){ 
      $('.chrome').show();
      $('.loading').hide();
      $('.explore').hide();
    }

    // Show loading progress
    else {
      $('.loading').show();
      $('.chrome').hide();
      $('.explore').hide();
    }
    
    $('.explore').on('click', this.close );

    if ( props.cookies && !this.checkIfThereStillCookies() ) {
      $("body").prepend('<div class="cookies-info"><div class="col-md-9 col-sm-9 col-xs-9"><p>This website use cookies to provide a good user experience, by continuing you agree with the use of cookies.</p></div><div class="col-md-3 col-sm-3 col-xs-3 hidden-xs"><div class="cookies-btn button">Continue</div></div><div class="col-md-3 col-sm-3 col-xs-3 visible-xs"><div class="cookies-btn button">Ok</div></div></div>')
      $('.cookies-btn').click( function (evt) {
        var info_height = $('.cookies-info').outerHeight();
        $('.cookies-info').css({top:-info_height})
      })
    }

    if ( props.share ) {

      app.prepend('<div class="share-menu"><div class="share-icon fa-envelope-o mail"></div><div class="share-icon fa-facebook" ></div><div class="share-icon fa-twitter"></div><div class="share-icon fa-heart-o like"></div></div>')
      
      // Share on Facebook 
      var facebook_link = "https://www.facebook.com/sharer/sharer.php?u=" + "http://www.datastorytellinggroup.org/refugees";
      $('.fa-facebook').click(function (evt) {
        window.open( facebook_link, "_blank" );
      })

      
      // Share on Twitter
      var tweet_title  = this.title + " " + this.description;
      var max_length = 140 - this.url.length
      tweet_title = tweet_title.length > max_length? tweet_title.substr(0, max_length - 1) + '…' : tweet_title;
      var tweet_link = 'http://twitter.com/home?status='+ encodeURIComponent(tweet_title + this.url);
      
      $('.fa-twitter').click(function (evt) {
        window.open( tweet_link, "_blank" );
      })


      // Share by email
      $('.mail').click(function (evt) {  
        window.open("mailto:address@gmail.com?subject=" + props.title + "&body=" + props.description, "_blank" );
      })


      // Like the page
      // Need to connect to a DB
      var like = $('.like');
      like.click( function ( evt ) {
        if (like.hasClass("fa-heart-o")) {
          like.removeClass("fa-heart-o")
          like.addClass("fa-heart")
        } else {
          like.removeClass("fa-heart")
          like.addClass("fa-heart-o")
        }
      })

      // Back to cover

      $('.back-to-cover').click(function (evt) {
        that.open()
      })

    }

  },

  checkIfThereStillCookies: function () {
    return false;
  },

  open: function () {
    $('.cover').fadeIn(this.animDuration);
    $('.app').addClass('blur');
  },

  close: function () {
    $('.cover').fadeOut(this.animDuration);
    $('.app').removeClass('blur');
  },

  contentLoaded: function () {
    if( this.onlyChrome && !this.isChrome ){
      $('.chrome').show();
      $('.explore').hide();
      $('.loading').hide();
    } else {
      $('.explore').show().fadeIn(300);
      $('.loading').hide();
    }
  },

  isGoogleChrome: function () {
    return navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
  }

}

