
//  ROUTER ************
// https://github.com/krasimir/navigo
var root = null;
var useHash = true; // Defaults to: false
var hash = '#!'; // Defaults to: '#'
var router;



var colors;
// SORT BY COLOUR VALUES
// https://stackoverflow.com/questions/25822124/sort-colour-color-values



// CONTACT PAGE ********
var map;
var mapCenter = {lat: 42.53543, lng:40.40492};
var mapZoom = 3;

// Credentials
var credentials = { 
  app_id: "UythJfir49K0ZHzunhFA", 
  app_code: "z9BEl98pKbJ96IKpeF30BQ" 
};

var loc_info = {
  city: "Berlin",
  country: "Germany",
  lat: 52.516666666666666,
  lng: 13.400000
}

var orig_info = {
  city: "Maracaibo",
  country: "Venezuela",
  lat: 10.69175,
  lng: -71.5593
}

var studies_info = {
  city: "Barcelona",
  country: "Spain",
  lat: 41.38523,
  lng: 2.17268
}



// Mansory
var grid;
var grid_types = [ 'h200', 'h400', 'h200w400' ];
var json_data;
var current_selected_project = null;
var selected_item;
var current_scroll = 0;


// Categories ****
var unique_categories = [];

function sortByDateAscending(a, b) {
    return a.date - b.date;
}


var is_unlock = false;
var grid_container = $('.grid');
var tmp_all_categories = [];
var cover_images = [];

function loadContent ( url ) {

  $.getJSON( url, function(json) {
    
    json_data = json;

    tmp_all_categories = [];
    grid_container = $('.grid');
    
    var tmp_projects = json_data.projects;
    var projects_length = tmp_projects.length;
    var tmp_about = json_data.about;

    $('.about_me').html(tmp_about);

    preloadCovers( tmp_projects );

  });
}

function initStartAnimation () {
  $('.intro').css({ boxShadow: 'inset 0px 0px 0px 0px blue' })
}

function continueRender ( projects ) { 

  $('.logotype')
    .delay(800)
    .queue(function (next) { 
      $(this).css({ top: '0px' });
      $('.vimeo').animate({
        top: "0px",
      }, 100 );
      $('.instagram').animate({
        top: "0px",
      }, 300 );
      $('.linkedin').animate({
        top: "0px",
      }, 600 );
      next();
  });


  for (var i = 0; i < projects.length; i++) {

      let tmp_item = projects[i];
      let item_height = grid_types[tmp_item.size];
      let selected_color = tmp_item.bg_color;
      let selected_ui_color = tmp_item.ui_color;
      let tmp_lum = chroma(selected_color).luminance();

      if (tmp_item.is_private && !is_unlock ) continue;

      // Automatize the average color
      // var rgb = getAverageRGB(document.getElementById('i'));
      // document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
      
      // Categories are useful for filtering
      var tmp_categories = "";

      for (var x = 0; x < tmp_item.categories.length; x++) {
        tmp_all_categories.push(tmp_item.categories[x]);
        tmp_categories += " " + tmp_item.categories[x].replace(" ", "-");
      }
      
      var target_width = null;
      var color = tmp_item.bg_color;
      var tmp_html_literal = `<div year="${tmp_item.date}" unique="${tmp_item.unique_url}" class="item ${item_height}">
            <div class="item-inner" style="background-position:center; background-size: cover; 
            background-image:url('./assets/images/${tmp_item.unique_url}/${tmp_item.cover_img}');
            background-color: ${ tmp_item.bg_color };">
              <div class="overlay">
                <h1 class="title" style="color: ${selected_ui_color};">${tmp_item.name}</h1>
                <h2 class="subtitle" style="color: ${selected_ui_color};">${tmp_item.subtitle}</h2>
              </div>
            </div>
          </div>`;

      grid_container.append( tmp_html_literal );
      
    }

    
    // Fade in items with 3D zoom effect (iOS-style)
    $('.grid .item').each(function(){
      var target_w = $(this).width();
      $(this).css({
        opacity: 0,
        transform: 'scale(1.5) translateZ(200px)',
        'transform-style': 'preserve-3d'
      });
      $(this).delay((Math.random() * 1000)).animate({ 
        opacity: 1
      }, { 
        duration: (Math.random() * 700 + 500), 
        easing: "easeOutExpo",
        step: function(now, fx) {
          if (fx.prop === 'opacity') {
            // Animate scale from 1.5 to 1 as opacity goes from 0 to 1
            var scale = 1.5 - (now * 0.5);
            var translateZ = 200 - (now * 200);
            $(this).css({
              'transform': 'scale(' + scale + ') translateZ(' + translateZ + 'px)'
            });
          }
        },
        complete: function () {
          $(this).css({
            'transform': 'scale(1) translateZ(0px)'
          });
      } })
    })

    // Shiny border effect - track mouse movement on items
    $('.grid .item').on('mousemove', function(e) {
      var $item = $(this);
      var itemOffset = $item.offset();
      var itemWidth = $item.outerWidth();
      var itemHeight = $item.outerHeight();
      
      // Calculate mouse position relative to item (0 to 100%)
      var x = ((e.pageX - itemOffset.left) / itemWidth) * 100;
      var y = ((e.pageY - itemOffset.top) / itemHeight) * 100;
      
      // Update CSS variables for gradient position
      $item.css({
        '--gradient-x': x + '%',
        '--gradient-y': y + '%'
      });
    });
    
    $('.grid .item').hover( function () {
        // console.log("Hover a item")
          // var typed = new Typed('.item .title', {
          //   strings: ["First ^30000 sentence.", "Second sentence."],
          //   showCursor: false
          // });

    })
    

    var unique_categories = tmp_all_categories.filter( function onlyUnique(value, index, self) { 
      return self.indexOf(value) === index;
    })

    initGrid();
    initRouter();
    initCategories( unique_categories );
    initFooter( json_data.about );
    initLogotype( json_data )
}


function showLoader ( bool ){ 
  if (bool) {
    $('.frame').css('animation-name', 'loaderAnim' );
    $('.frame').css('animation-iteration-count', 'infinite' );
    $('.loader').show();
  } else {
    $('.frame').css('animation-iteration-count', 1 );
    $('.loader').hide();
  }
}

function preloadCovers ( projects ) {

  for (var i = 0; i < projects.length; i++) {
    cover_images.push(projects[i].cover_img) 
  }
  
  removeImages();

  var tmp_imgs = cover_images;
  var amount = tmp_imgs.length;

  for (var i = 0; i < amount; i++) {
    $('.bg-func').append(`<div class="lazy" index="${i}" data-src="${tmp_imgs[i]}"></div>`);
    $('.image-counter h2').text('Loading ...')
  }

  // remove items
  $('.img-items').empty();
  
  // Now we can preload
  $(".lazy").Lazy({
    
    autoDestroy: false,
    bind: "event",
    visibleOnly: false,

    beforeLoad: function(element) {
      showLoader(true)
    },
    afterLoad: function(element) {
      // console.log("Load!")
    },
    onError: function(element) {
      // console.log("ERROR", element )
    },
    onFinishedAll: function() {
      // console.log("covers images loaded")

      showLoader(false);
      continueRender(projects)

      var typed = new Typed('.header .what', {
        strings: ["Hello world!^2000", "Product Designer^2000", "Creative Technologist^2000", "Data Viz Designer^2000" ],
        showCursor: true,
        startDelay: 1500,
        loop: true,
        cursorChar: '|',
        smartBackspace: true,
        typeSpeed: 50,
        backSpeed: 50,
        smartBackspace: true,
      });
      
    }
  });

}



var order_index = 1;

function setupGrid() {

  grid_container = $('.grid');
  grid_container.empty();

  var tmp_projects = json_data.projects;
  var projects_length = tmp_projects.length;
  var tmp_colors = json_data.colors;

  for (var i = 0; i < projects_length; i++) {

    var tmp_item = tmp_projects[i];
    var item_height = grid_types[tmp_item.size];
    var selected_color = tmp_item.bg_color;
    var tmp_lum = chroma(selected_color).luminance();

    if (tmp_item.is_private && !is_unlock ) continue;

    // Automatize the average color
    // var rgb = getAverageRGB(document.getElementById('i'));
    // document.body.style.backgroundColor = 'rgb('+rgb.r+','+rgb.g+','+rgb.b+')';
    
    // Categories are useful for filtering
    var tmp_categories = "";

    for (var x = 0; x < tmp_item.categories.length; x++) {
      tmp_all_categories.push(tmp_item.categories[x]);
      tmp_categories += " " + tmp_item.categories[x].replace(" ", "-");
    }
    
    var color = tmp_item.bg_color;

    var tmp_html_literal = `<div year="${tmp_item.date}" unique="${tmp_item.unique_url}" class="item ${item_height}">
          <div class="item-inner" style="background-position:center; background-size: cover; 
          background-image:url('./assets/images/${tmp_item.unique_url}/${tmp_item.cover_img}');
          background-color: ${ tmp_item.bg_color };">
            <div class="overlay"></div>
            <h1 class="title" style="color: ${tmp_item.ui_color};">${tmp_item.name}</h1>
            <h2 class="subtitle" style="color: ${tmp_item.ui_color};">${tmp_item.subtitle}</h2>
            <div class="categories ${tmp_categories}"></div>
          </div>
        </div>`;

    grid_container.append( tmp_html_literal );

  }

  var unique_categories = tmp_all_categories.filter(function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  })

}

function initLogotype ( content ) {
  $('.logotype').text( content.logotype );
  $('.what').text( content.what )
}

function initAbout ( content ) {
  
  $('.main-block').html( content.me )
  $('.side-block').html( `<div class="block">
    <img class="profile" src="./assets/images/profile.jpg">
    <p>I'm currently working fulltime as <strong>${content.jobs[0].position}</strong> at ${content.jobs[0].company}.</p>
    <p>Get in touch for work or related matters, I keep myself available for interesting oportunities &amp; collaborations, and/or a cup of coffee if you happen to be in Berlin.</p>
    <p><a href="mailto:${content.email}">${content.email}</a></p>
    </div>`);
}

function initFooter ( content ) {
  $('.credits').html(`&mdash; All rights reserved to ${"Daniel González"}, <span class="foo-year">${(new Date()).getFullYear()}</span>.`);
  $('.project-list').css( { minHeight: window.innerHeight + 'px' });
  $('.footer').css({opacity: 1})
}

function initUI () {

  // UNLOCK PRIVATE CONTENT
  var container = $('.unlock-content');
  var input = $('.password');

  $('.private-btn').click ( function () {
    $('.index-layout').addClass('blur')
    container.css({opacity:1, display:"block"});
    
  })

  var encrypt_pass = "3101";
  var current_pass = "";

  $('.numeral li').click( function () {

    var tmp_number_str = $(this).text();
    current_pass += tmp_number_str; 
    console.log(current_pass);
    
    if (current_pass.length == 4 ){

      if ( current_pass === encrypt_pass ) {

        // Correct secret
        $('.index-layout').removeClass('blur')
        // $('.noise').css('opacity', 0)
        container.fadeOut(400);
        $('.private-btn').addClass("unlock").unbind("click").css({opacity: 0.3, pointerEvents: 'none' })
        is_unlock = true;
        $('.feedback').text('');
        showPrivateProjects();

      } else {

        // Wrong secret
        document.getElementById("password").value = current_pass;
        current_pass = "";
        input.fadeOut(1000).show(0);
        container.effect( "shake",{}, 400, function () {
        document.getElementById("password").value = current_pass;
        $('.feedback').text('Incorrect code! please, try again. Reach out via email if your passcode do not work.');
        });
      }

    } else {
      // Keep Typing
      // input.value( current_pass );
      document.getElementById("password").value = current_pass;

    } 

  })
  
}

function showPrivateProjects ( bool ) {

  var tmp_projects = json_data.projects;
  var projects_length = tmp_projects.length;

  for (var i = 0; i < projects_length; i++) {

    var tmp_item = tmp_projects[i];
    var item_height = grid_types[tmp_item.size];
    var selected_color = tmp_item.bg_color;
    var tmp_lum = chroma(selected_color).luminance();

    if (tmp_item.is_private ) {
      // Categories are useful for filtering
      var tmp_categories = "";

      for (var x = 0; x < tmp_item.categories.length; x++) {
        tmp_all_categories.push(tmp_item.categories[x]);
        tmp_categories += " " + tmp_item.categories[x].replace(" ", "-");
      }
      
      var color = tmp_item.bg_color;

      var $boxes = $(`<div year="${tmp_item.date}" unique="${tmp_item.unique_url}" class="item ${item_height}">
            <div class="item-inner" style="background-position:center; background-size: cover; 
            background-image:url('./assets/images/${tmp_item.unique_url}/${tmp_item.cover_img}');
            background-color: ${ tmp_item.bg_color };">
              <h1 class="title" style="color: ${tmp_item.ui_color};">${tmp_item.name}</h1>
              <div class="categories ${tmp_categories}"></div>
            </div>
          </div>`);

      $boxes.click( function () {
        selected_item = $(this);
        var tmp_unique_id = selected_item.attr('unique')
        showProject(tmp_unique_id)
      })

      grid_container.append( $boxes ).masonry( 'prepended', $boxes );
      
    }
  }
}


function initRouter () {

  // console.log("Init Router")
  router = new Navigo(root, useHash, hash);

  router.on({
    
    // PROJECT GRID
    '*': function ( params ) {
      // console.log("Hide everything", params )
      showContact( false);
    },

    // SELECTED PROJECT 
    'projects/*': function () {
      var unique_id_and_parameters = (window.location.href.split("#!projects/")[1]);
      var params = unique_id_and_parameters.split("?success=")[1];
      var unique = unique_id_and_parameters.split("?success=")[0];
      showProject( unique )
      wasEmailSent(params);
    },

    // ABOUT
    '/about': function () {
      showContact(true);
    }
    

  })
  .resolve();
}


function wasEmailSent( success ){
  
  if (success) {
    $('.project-info .buy').addClass("sent").text("Price requested");
    $('.project-info form').remove();
    $('.project-info').append("<label class='requested'>Price requested</label>")
  } else {
    $('.sent').remove();
    $('.requested').remove();
  }
}

function getAverageRGB(imgEl) {
    
    var blockSize = 5, // only visit every 5 pixels
        defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
        canvas = document.createElement('canvas'),
        context = canvas.getContext && canvas.getContext('2d'),
        data, width, height,
        i = -4,
        length,
        rgb = {r:0,g:0,b:0},
        count = 0;
        
    if (!context) {
        return defaultRGB;
    }
    
    height = canvas.height = imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
    width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;
    
    context.drawImage(imgEl, 0, 0);
    
    try {
        data = context.getImageData(0, 0, width, height);
    } catch(e) {
        /* security error, img on diff domain */alert('x');
        return defaultRGB;
    }
    
    length = data.data.length;
    
    while ( (i += blockSize * 4) < length ) {
        ++count;
        rgb.r += data.data[i];
        rgb.g += data.data[i+1];
        rgb.b += data.data[i+2];
    }
    
    // ~~ used to floor values
    rgb.r = ~~(rgb.r/count);
    rgb.g = ~~(rgb.g/count);
    rgb.b = ~~(rgb.b/count);
    
    return rgb;
    
}




function initApp () {

  
  initStartAnimation ();

  loadContent('./data/content.json');
  initUI();
  
  $('.menu .btn').click( function () {
    router.navigate('/about');
    $('.project-list').addClass('blur')
    // $('.noise').css('opacity', 0.1)
  })

  $('.menu .close').click( function () {
    router.navigate('');
    $('.project-list').removeClass('blur')
  })

  $('.header .what').text('loading ...')
  
}

function initCategories ( cat_array ) {


  // Init categories switcher 
  for (var i = 0; i < cat_array.length; i++) {
    var cat_with_no_dash = cat_array[i].replace("-"," ")
    var tmp_cat_item = toTitleCase(cat_with_no_dash)
    $('.orderlist').append(`<div class="option">Showing <span class="filter">${tmp_cat_item}</span></div>`);
  }

  $('.orderlist').click ( function () {
    $('.orderlist .selected').removeClass('selected')
    
    order_index ++;
    if ( order_index > $('.option').length ) order_index = 1;
    $(`.option:nth-child(${order_index})`).addClass('selected')
    
    var tmp_categorie = $(this).find("filter").prevObject[0].innerText.substr(8);
    tmp_categorie = tmp_categorie.replace(" ", "-");
    if (tmp_categorie == "Everything") {
      $('.item').css({opacity: 1})
      return;
    }


    var tmp_class = ".item ." + tmp_categorie.toLowerCase();
    
    $('.item').animate({
      opacity: .1
    }, 500, 'easeOutExpo', function() {
      $(tmp_class).parent().css({opacity:1});
    })
    
  })

}


function showContact ( bool ) {
  if ( bool ) {
    $('.left-frame').addClass('show-close')
    $('.menu .btn').removeClass('selected').addClass('not-selected')
    $(this).addClass('selected').removeClass('not-selected')
    $('.about').css({opacity:1, pointerEvents:'all'});
    $('.menu .close').show();
    $('.index-layout').css({pointerEvents:'none', overflow:'hidden'});
    $('.orderlist').fadeOut(200);
    $('.private-btn').fadeOut(200);
    showSocial(false);
  
  } else {

    $('.left-frame').removeClass('show-close')
    $('.menu .btn').removeClass('selected').removeClass('not-selected')
    $('.about').css({opacity:0, pointerEvents: 'none'});
    $('.menu .close').hide();
    $('.index-layout').css({pointerEvents:'all', overflow:'auto'})
    $('.orderlist').fadeIn(200);
    $('.private-btn').fadeIn(200);
    showSocial(true);
  }
}

function showSocial( bool ){
  if (bool){
    $('.social').show();
  } else {
    $('.social').hide();
  }
}

function showRoleDescription ( bool ) {
  if (bool){
    $('.what').show();
  } else {
    $('.what').hide();
  }
}



function initGrid () {



  // Post Interaction & transition to fullscreen
  var absoluteLeft;
  var relativeTop;
  var width;
  var height;


  
    
  g_grid = $('.grid');
  g_grid.masonry({
    itemSelector: '.item',
    columnWidth: '.h400',
    percentPosition: true
  })

  

  //updateGridSize();


  $('.close-info').click( function () {

    if ( $(this).hasClass('active')){
      $(this).removeClass('active')
      $('.project-info').removeClass('open')
      $('.background').removeClass('blur')
      $('.slideshow-controls').show();
      $('.image-container').removeClass('blur');
      $('.back-to-list').show();
      $('.image-counter').removeClass('blur');

    } else {
      $('.back-to-list').hide();
      $(this).addClass('active')
      $('.project-info').addClass('open')
      $('.background').addClass('blur')
      $('.slideshow-controls').hide();
      $('.image-container').addClass('blur');
      $('.image-counter').addClass('blur');
      
    }

  })

  


  // // SLIDESHOW CONTROLS
  // Update image when clicking next/prev buttons
  $('.prev-btn').click ( function () {
    getPrevImage();
    updateSlideShowImage(current_selected_img)
    updateSlideshowUIByIndex(current_selected_img)
  })


  $('.next-btn').click ( function () {
    getNextImage()
    updateSlideShowImage(current_selected_img)
    updateSlideshowUIByIndex(current_selected_img)
  })


  $('.item').click( function () {
    selected_item = $(this);
    var tmp_unique_id = selected_item.attr('unique')
    showProject(tmp_unique_id)
  })

  $('.back-to-list').click(function () {
    hideCurrentProject();
  })

}


// Throttle function to limit resize handler calls (allows updates during resize, but less frequently)
function throttle(func, limit) {
  var inThrottle;
  return function() {
    var args = arguments;
    var context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(function() {
        inThrottle = false;
      }, limit);
    }
  };
}

// Throttled resize handler - updates layout during resize, but max once per 150ms
$( window ).resize( throttle(function() {
  //updateGridSize();
}, 150) );



function hideCurrentProject() {

  $('.header').css("pointer-events","all")

  current_unique_id = null;
  $(window).scrollTop(current_scroll);

  $('.ui').fadeOut(300);

  $('.orderlist').fadeIn(200);
  $('.private-btn').fadeIn(200);
  $('.project-scroll-top').removeClass('is-visible');

  // $('.frame').css({boxShadow: 'inset 0px 0px 0px 8px rgb(240,240,240)'})
  $('.frame').removeClass('project-mode')//.css({boxShadow: 'inset 0px 0px 0px 8px rgb(240,240,240)'})
  $('.header').removeClass('h-project-mode');


  if (selected_item == undefined ) {
    // Do not animated
    $('.project-layout').removeClass('fullscreen')
    $('.project-layout').css({opacity:0, pointerEvents: 'none' });
    $('.menu').fadeIn(1000);
    router.navigate('');

  } else {
    // animate from fullscreen to element
    absoluteLeft = selected_item.offset().left;
    relativeTop = (selected_item.offset().top - $(window).scrollTop());
    width = selected_item.width();
    height = selected_item.height();
    $('.project-layout').removeClass('fullscreen')
    $('.project-layout').animate({
      top: relativeTop,
      left: absoluteLeft,
      width: width,
      height: height,
    }, 800, 'easeInOutExpo', function() {
      $(this).css({opacity:0, pointerEvents: 'none' });
      $('.menu').fadeIn(1000);
      router.navigate('');
    })
  }
  
  $('.project-info .btn').removeClass('active')
  $('.project-info').removeClass('open')
  $('.background').removeClass('blur')
  $('.slideshow-controls').show();
  $('.image-container').removeClass('blur');

  current_selected_project = null;

  $('.video-container').empty();
  $('.what').removeClass("black")
  $('.ui').removeClass('black')
  $('.social a').removeClass('black')

  showSocial(true);
  showRoleDescription(true);
}




var current_selected_img = 0;
var current_unique_id = null;

function showProject( unique_id ) {

  $('.header').css("pointer-events","none")
  showSocial(false);

  var scrollContainer = $('.project-layout .ui');
  var scrollTopBtn = $('.project-scroll-top');
  scrollContainer.scrollTop(0);
  scrollTopBtn.removeClass('is-visible');

  current_scroll = $(window).scrollTop();
  if (unique_id == current_unique_id) return;

  current_unique_id = unique_id;
  current_selected_project = findIDInDB(unique_id);

    var selected_color = current_selected_project.bg_color || '#ffffff';

    var tmp_lum = chroma(selected_color).luminance();
    if (tmp_lum > 0.5) {
      $('.what').addClass('black')
      $('.social a').addClass('black')
    }
    else {
      $('.what').removeClass('black')
      $('.social a').removeClass('black')
    }

    const rawUiColor = current_selected_project.ui_color || '#121212';
    let accentColor = rawUiColor;
    let bodyColor = rawUiColor;
    let mutedColor = rawUiColor;
    let subtleColor = rawUiColor;

    try {
      const tone = chroma(rawUiColor);
      accentColor = tone.hex();
      const base = tone.luminance() > 0.55 ? tone.darken(1.5) : tone.brighten(0.6);
      bodyColor = base.alpha(0.85).css();
      mutedColor = base.alpha(0.6).css();
      subtleColor = base.alpha(0.35).css();
    } catch (error) {
      accentColor = rawUiColor;
      bodyColor = rawUiColor;
      mutedColor = rawUiColor;
      subtleColor = rawUiColor;
    }

    $('.project-layout').css({
      '--project-surface-color': selected_color,
      '--project-ui-color': accentColor,
      '--project-body-color': bodyColor,
      '--project-ui-color-muted': mutedColor,
      '--project-ui-color-subtle': subtleColor
    });

    // Reset image slideshow
    $('.image-container .image').css({
      backgroundImage: 'none'
    });

    preloadImages();

    // Find in node in JSON
    for (var i = 0; i < json_data.projects.length; i++) {

      if (json_data.projects[i].unique_url == unique_id ){

        var tmp_cat = " ";
        var cats = json_data.projects[i].categories;

        if (cats.length > 1) {
          for ( var x = 0; x < cats.length; x++ ) {
            
            var cat_with_no_dash = cats[x].replace("-"," ")
            var tmp_cat_item = toTitleCase(cat_with_no_dash)

            if ( x == cats.length - 1 ) tmp_cat += " & " + tmp_cat_item;
            else if ( x == 0 ) tmp_cat += tmp_cat_item;
            else tmp_cat +=  ", " + tmp_cat_item;
          }        
          
        } else {
          tmp_cat = cats[0]
        }

        var location_ref = `http://degafolio.info/paintings/#!projects/${unique_id}`;

        // Set info
        $('.project-info .name, .project-toolbar__title').text(json_data.projects[i].name)
        const descriptionHTML = json_data.projects[i].description && json_data.projects[i].description.trim().length ? json_data.projects[i].description : '<p>Case study content coming soon.</p>';
        $('.project-info .description').html(descriptionHTML)
        const formattedCategories = tmp_cat.trim();
        const categoriesLabel = formattedCategories ? `Focus — ${toTitleCase(formattedCategories)}` : '';
        const clientLabel = json_data.projects[i].client ? `Client — ${json_data.projects[i].client}` : '';
        $('.project-info .categories').text( categoriesLabel )
        $('.project-info .client').text(clientLabel)
        $('.project-info form').remove();
        $('.project-info a').remove();

        break;

      }
    }

    $('.orderlist').fadeOut(200);
    $('.private-btn').fadeOut(200);
    $('.menu').fadeOut(100);
    $('.ui').delay(800).fadeIn(500);

    // Show transition-frame
    var tmp_delay = 0;
    var tmp_offset = 4;

    if (selected_item == undefined ) {
      
      // When open from URL *********
      tmp_delay = 200;
      selected_item = $(".grid").find(`[unique='${unique_id}']`);
      tmp_offset = 0;

      $("html").scrollTop( selected_item.offset().top - ($(window).height() - selected_item.height()) / 2)
      current_scroll = $(window).scrollTop();

    }

    // Flow from user click
    absoluteLeft = selected_item.offset().left - tmp_offset;
    relativeTop = (selected_item.offset().top - $(window).scrollTop()) - tmp_offset;
    width = selected_item.width();
    height = selected_item.height();

    $('.project-layout').css({
      top: relativeTop,
      left: absoluteLeft,
      width: width,
      height: height,
      backgroundColor: selected_color,
      opacity:1,
      pointerEvents: 'auto',
      display: 'initial'
    })

    $('.project-layout').delay(tmp_delay).animate({
      top: 8,
      left: 8,
      width: $(window).width() - 8,
      height: $(window).height() - 8
    }, 800, 'easeInOutExpo', function() {
      $(this).addClass('fullscreen')
      router.navigate('projects/' + unique_id );
    })


    $('.frame').addClass('project-mode');
    $('.header').addClass('h-project-mode');

    showRoleDescription(false);
}





function preloadImages () {

  console.log("Preloading images ...")

  removeImages();

  var tmp_imgs = current_selected_project.slideshow_imgs
  var amount = current_selected_project.slideshow_imgs.length;

  // remove items
  $('.img-items').empty();

  for (var i = 0; i < amount; i++) {
    $('.bg-func').append(`<div class="lazy" index="${i}" data-src="${tmp_imgs[i].url}"></div>`);
    if( amount > 1) $('.img-items').append( `<div index="${i}" class="img-item"></div>` );
  }

  // See if there is need of next/prev buttons
  if( amount > 1) {
    $('.prev-btn').show()
    $('.next-btn').show()
  } else {
    $('.prev-btn').hide()
    $('.next-btn').hide()
  }
  
  // Now we can preload
  $(".lazy").Lazy({
    
    autoDestroy: true,
    bind: "event",
    visibleOnly: false,

    beforeLoad: function(element) {
      showLoader(true)
    },
    afterLoad: function(element) {
      console.log("Load image!")
    },
    onError: function(element) {
      console.log("ERROR", element )
    },
    onFinishedAll: function() {
      showLoader(false)
      updateImageView(current_selected_project);
    }
  });

  updateImageView(current_selected_project);

}

function renderHTMLVideo ( index, type ) {
  if ( type == "vimeo" ) {
    return `<div style="padding:56.25% 0 0 0;"><iframe src="https://player.vimeo.com/video/${getImageByIndex(index)}?autoplay=1&muted=1&color=fff&title=0&byline=0&portrait=0" style="position:absolute;top:0;left:0;width:100%;height:100%;" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe></div><script src="https://player.vimeo.com/api/player.js"></script>`;
  }
  else if ( type == "youtube" ) {
    return `<iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${getImageByIndex(index)}?autoplay=1&mute=1" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  }
  else if ( type == "video" ){
    return `<video id="my-video" class="video" controls autoplay muted playsinline preload="auto" width="100%" height="100%" poster=""><source src="${getImageByIndex(index)}" type="video/mp4" /><source src="MY_VIDEO.webm" type="video/webm" /><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>`;
  } else{
    console.warn("PLEASE, CHECK THE VIDEO TYPE")
  }
}

function updateImageView ( selected_project ) {

  var tmp_imgs = selected_project.slideshow_imgs
  var amount = selected_project.slideshow_imgs.length;
  
  updateSlideShowImage(0)
  updateSlideshowUIByIndex(0)

  $('.image-counter h2').text(`1 of ${amount} Images`);

  var item_list = $('.img-item');
  item_list.first().addClass('selected');
  item_list.click( function (evt) {

    let current_index = $(this).attr("index");
    updateSlideShowImage(current_index)
    updateSlideshowUIByIndex(current_index)
    current_selected_img = current_index;
  })

  // Reset image counter to 0
  current_selected_img = 0;

}




function updateSlideShowImage ( current_index ) {

  $('.video-container').empty() // First we remove the old video

  if ( isVideo(current_index)){
    $('.video-container').html( renderHTMLVideo( current_index, current_selected_project.slideshow_imgs[current_index].type ))
    $('.image-container .image').css({ backgroundImage: `none`});
    $('.image-container .bg-blured-image').css({ backgroundImage: `none`});
  
  } else {
    $('.image-container .image').css({ backgroundImage: `url('${getImageByIndex(current_index)}')` });
    $('.image-container .bg-blured-image').css({ backgroundImage: `url('${getImageByIndex(current_index)}')` });
  }
}



function updateGridSize () {    
    if (grid_container && grid_container.data('masonry')) {
      // grid_container.masonry('layout');
      console.log("UPDATING GRID")
    }
}



function removeImages () {
  $('.bg-func').empty();
  $('.video-container').empty()
}

function updateSlideshowUIByIndex( index ) {
  $('.img-item').removeClass('selected');
  $( `.img-item[index='${index}']` ).addClass('selected');
  $('.image-counter h2').text(`${parseInt(index) + 1} of ${current_selected_project.slideshow_imgs.length} Images`);
}




function getImageByIndex ( index ) {
  var tmp_item = current_selected_project;
  return `./assets/images/${tmp_item.unique_url}/${tmp_item.slideshow_imgs[index].url}`;
}

function getVideoPosterByIndex ( index ) {
  var tmp_item = current_selected_project;
  return `./assets/images/${tmp_item.unique_url}/${tmp_item.slideshow_imgs[index].poster}`;
}

function isVideo ( index ) {
  return current_selected_project.slideshow_imgs[index].type == "vimeo" || current_selected_project.slideshow_imgs[index].type == "video" || current_selected_project.slideshow_imgs[index].type == "youtube"
}


window.addEventListener("keydown", (event) => {
  if (current_selected_project){
    switch (event.code) {
      case "ArrowRight":
        getNextImage()
        updateSlideShowImage(current_selected_img)
        updateSlideshowUIByIndex(current_selected_img)
        break;
      case "ArrowLeft":
        getPrevImage()
        updateSlideShowImage(current_selected_img)
        updateSlideshowUIByIndex(current_selected_img)
        break;
      case "Escape":
        hideCurrentProject();
        break;

    }
  }
    
});


function getNextImage () {
  current_selected_img++; 
  if ( current_selected_img >= current_selected_project.slideshow_imgs.length )
    current_selected_img = 0;
  return current_selected_project.slideshow_imgs[current_selected_img].url
}

function getPrevImage () {
  current_selected_img--;
   if ( current_selected_img < 0 )
    current_selected_img = current_selected_project.slideshow_imgs.length - 1;
  return current_selected_project.slideshow_imgs[current_selected_img].url
}

function findIDInDB ( id ) {

  var tmp_project = json_data.projects;
  for (var i = 0; i < tmp_project.length; i++) {
    if (tmp_project[i].unique_url == id ) 
      return tmp_project[i];
  }
  return "no project found with this unique_id";
}

function toTitleCase ( string ) {
  return string.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}



function initProjectScrollTopButton() {
  var $container = $('.project-layout .ui');
  var $button = $('.project-scroll-top');

  if (!$container.length || !$button.length) return;

  var toggleButton = function() {
    if ($container.scrollTop() > 200) {
      $button.addClass('is-visible');
    } else {
      $button.removeClass('is-visible');
    }
  };

  $container.off('scroll.projectScrollTop').on('scroll.projectScrollTop', toggleButton);

  $button.off('click.projectScrollTop').on('click.projectScrollTop', function() {
    $container.animate({ scrollTop: 0 }, 500);
  });

  toggleButton();
}


function setup () {
  console.log("Init App");
  initApp();
  initProjectScrollTopButton();
}


// **************************************************************************
//  INIT APP WHEN EVERYTHING IS READY
// **************************************************************************
$(document).ready(function() {
  setup();
  
});

