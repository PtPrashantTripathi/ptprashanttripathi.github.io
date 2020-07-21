/** *************Init JS*********************
	
    TABLE OF CONTENTS
	---------------------------
	1.Load function
	2.Set height-width function
	3.Matresume function
	4.MasonryPortfolio function
	5.Ready function
	6.Resize function
	7.LightGallery Init
	8.Availablity Calendar
 ** ***************************************/
 
 "use strict"; 
/*****Load function start*****/
$(window).load(function(){
	$(".preloader-it").delay(500).fadeOut("slow");
	if(window.location.href.indexOf("index.html#") > -1) 
		$("html, body").animate({scrollTop: $(window.location.hash).offset().top - 50 }, 800);
});
/*****Load function* end*****/

/***** Set height-width function start *****/
var setHeightWidth = function () {
	var height = $(window).height();
	$('.full-height').css('min-height', (height));
	$('#map_canvas').height($('#form_card_height').height());
	$('.full-width-header').width($('.main-wrapper').width());
};
/***** Set height-width function end *****/

/***** Matresume function start *****/
var matResume = function () {
	/*SmoothScroll*/
	smoothScroll.init({
		speed: 800,
		easing: 'easeInOutCubic',
		offset: 50,
		updateURL: false,
		callbackBefore: function ( toggle, anchor ) {},
		callbackAfter: function ( toggle, anchor ) {},
	});
	
	/*Scrollspy*/
	var bodySel = $("#body");
	bodySel.scrollspy({ target: ".mdl-scroll-spy-1",offset:52 });
	var scollSpy2ActiveLI = "";
	bodySel.on('activate.bs.scrollspy', function () {
		if (scollSpy2ActiveLI != "") {
			scollSpy2ActiveLI.removeClass('active');            
		}        
		var activeTab = $('.mdl-scroll-spy-1 li.active a').attr('href');
		scollSpy2ActiveLI = $('.mdl-scroll-spy-2 li a[href="' + activeTab + '"]').parent();
		scollSpy2ActiveLI.addClass('active');
	})
	bodySel.trigger('activate.bs.scrollspy');
	
	/*Progressbar animation*/
	var progressBar = $('.progress-bar-graph div');
	for(var i = 0; i < progressBar.length; i++){
		$(progressBar[i]).appear(function(){			
			var percent = $(this).find('span').attr('data-width');
			var $endNum = parseInt($(this).find('.bar-wrap strong i').text(),10);
			
			var $that = $(this);			
			$(this).find('span').animate({
				'width' : percent + '%'
			},1600, function(){
			});			
			$(this).find('.bar-wrap strong').animate({
				'opacity' : 1
			},1400);			
			if(percent == '100'){
				$that.find('bar-wrap strong').addClass('full');
			}	
		});
	}
	
	/* Map Initialization */
	if( $('#map_canvas').length > 0 ){	
		var settings = {
			zoom: 11,
			center: new google.maps.LatLng(40.6700, -73.9400),
			styles:[
				{
					"stylers": [
						{
							"hue": "#007fff"
						},
						{
							"saturation": 89
						}
					]
				},
				{
					"featureType": "water",
					"stylers": [
						{
							"color": "#ffffff"
						}
					]
				},
				{
					"featureType": "administrative.country",
					"elementType": "labels",
					"stylers": [
						{
							"visibility": "off"
						}
					]
				}
			]};		
			var map = new google.maps.Map(document.getElementById("map_canvas"), settings);	
			google.maps.event.addDomListener(window, "resize", function() {
				var center = map.getCenter();
				google.maps.event.trigger(map, "resize");
				map.setCenter(center);
			});	
			var contentString = '<div id="content-map-marker" style="text-align:left; padding-top:10px; padding-left:10px">'+
				'<div id="siteNotice">'+
				'</div>'+
				'<h4 id="firstHeading" class="firstHeading" style="color:#000; margin-bottom:0px;"><strong>Hello Friend!</strong></h4>'+
				'<div id="bodyContent">'+
				'<p style="font-family:Verdana; color:#999; font-size:12px; margin-bottom:10px">Here we are. Come to drink a coffee!</p>'+
				'</div>'+
				'</div>';
			var infowindow = new google.maps.InfoWindow({
				content: contentString
			});	
			
			var companyPos = new google.maps.LatLng(40.6700, -73.9400);	
			var companyMarker = new google.maps.Marker({
				position: companyPos,
				map: map,
				title:"Our Office",
				zIndex: 3});	
			google.maps.event.addListener(companyMarker, 'click', function() {
				infowindow.open(map,companyMarker);
			});	
		}
		
	/*Slimscroll*/
	$('.nicescroll-bar').slimscroll({height:'100%',color: '#01c853',opacity:1,size:5});
	
	/*Testimonial carousel*/
	$('.testimonial-carousel').owlCarousel({
		loop:true,
		margin:0,
		nav:true,
		navText: ["<i class='zmdi zmdi-arrow-left'></i>","<i class='zmdi zmdi-arrow-right'></i>"],
		dots:false,
		autoplay:true,
		responsive:{
			0:{
				items:1
			}
		}
	});
	
	/*Client carousel*/
	$('#client_sec .client-carousel').owlCarousel({
		loop:true,
		margin:15,
		nav:false,
		dots:false,
		responsive:{
			0:{
				items:1
			},
			200:{
				items:2
			},
			400:{
				items:3
			},
			600:{
				items:4
			},
			1300:{
				items:5
			}
		}
	});
};
/***** Matresume function end *****/

/***** MasonryPortfolio function start *****/		
if( $('.portfolio-wrap').length > 0 ){	
	var $container = $('.portf'),
	$body = $('body');
	
	/*Filter*/
	$(document).on( "click", "#filters a", function(e) {
		$('#filters a').removeClass('active');
		$(this).addClass('active');
		var selector = $(this).attr('data-filter');
		$('#portfolio').isotope({ filter: selector });		
		return false;
	});	
	/*Filter*/
	
	/*On Resize Portfolio Function*/
	var onResizePort= function() {
		$body.find('.portf').each(function () { 
			var winWidth = window.innerWidth;
			var container_mock = $('.gallery-wrap').width();
			columnNumb = 1;			
			var attr_col = $(this).attr('data-col');
				
			 if (winWidth >= 1466) {
				
				$('.portfolio-wrap').css( {width : container_mock});
				$('.portfolio-wrap.no-gutter').css( {width : container_mock});			
				$('.portfolio-wrap.no-gutter.full-width').css( {width : 100  + '%'});			
				var portfolioWidth = $('.portfolio-wrap').width();
				
				if (typeof attr_col !== typeof undefined && attr_col !== false) {
					columnNumb = $(this).attr('data-col');
				} else columnNumb = 3;
					
				var postWidth = Math.floor(portfolioWidth / columnNumb)			
				$(this).find('.item').each(function () { 
					$(this).css( { 
						width : postWidth - 20 + 'px',
						height : 'auto',
						margin : 10 + 'px' 
					});
					$('.no-gutter .'+$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : 'auto',
						margin : 0 + 'px' 
					});
					$('.wide.'+$(this).attr('class')).css( { 
						width : postWidth * 2 - 20 + 'px'  
					});
					$('.no-gutter .wide.'+$(this).attr('class')).css( { 
						width : postWidth * 2 + 'px'  
					});
					$('.tall.'+$(this).attr('class')).css( {
						height : 'auto' 
					});
					$('.small.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
				
					$('.no-gutter .tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 - 20 + 'px',
						height : postWidth * 2 - 20 + 'px'  
					});
					$('.no-gutter .wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 + 'px',
						height : 'auto', 
					});
				});
				
				
			} else if (winWidth > 1024) {
				
				$('.portfolio-wrap').css( {width : container_mock});
				$('.portfolio-wrap.no-gutter').css( {width : container_mock});		
				var portfolioWidth = $('.portfolio-wrap').width();
							
				if (typeof attr_col !== typeof undefined && attr_col !== false) {
					columnNumb = $(this).attr('data-col'); //alert(columnNumb);
				} else columnNumb = 3;
				
				postWidth = Math.floor(portfolioWidth / columnNumb)			
				$(this).find('.item').each(function () { 
					
					$(this).css( { 
						width : postWidth - 20 + 'px',
						height : 'auto',
						margin : 10 + 'px' 
					});
					
					$('.no-gutter .' +$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : 'auto',
						margin : 0 + 'px' 
					});
					$('.wide.'+$(this).attr('class') ).css( { 
						width : postWidth * 2 - 20 + 'px'  
					});
					$('.no-gutter .wide.'+$(this).attr('class')).css( { 
						width : postWidth * 2 + 'px'  
					});
					$('.tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.small.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
					$('.no-gutter .tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 - 20 + 'px',
						height : 'auto', 
					});
					$('.no-gutter .wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 + 'px',
						height : 'auto', 
					});
				});
				
				
			} else if (winWidth > 767) {
				
				$('.portfolio-wrap').css( {width : container_mock});
				$('.portfolio-wrap.no-gutter').css({width : container_mock});
				var portfolioWidth = $('.portfolio-wrap').width(),
				
				columnNumb = 2;
				postWidth = Math.floor(portfolioWidth / columnNumb)			
				$(this).find('.item').each(function () { 
					$(this).css( { 
						width : postWidth - 20 + 'px',
						height : 'auto',
						margin : 10 + 'px' 
					});
					$('.no-gutter .'+$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : 'auto',
						margin : 0 + 'px' 
					});
					$('.wide.'+$(this).attr('class')).css( { 
						width : postWidth * 2 - 20 + 'px'  
					});
					$('.no-gutter .wide.'+$(this).attr('class')).css( { 
						width : postWidth * 2 + 'px'  
					});
					$('.tall.'+$(this).attr('class')).css( {
						height : 'auto',
					});
					$('.small.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
					$('.no-gutter .tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 - 20 + 'px',
						height : postWidth   + 'px', 
					});
					$('.no-gutter .wide-tall.'+$(this).attr('class')).css( {
						width : postWidth * 2 + 'px',
						height : 'auto', 
					});
				});
				
				
			}	else if (winWidth > 479) {
				
				$('.portfolio-wrap').css( {width : container_mock});
				$('.portfolio-wrap.no-gutter').css( {width : container_mock});
				var portfolioWidth = $('.portfolio-wrap').width(),
				
				columnNumb = 1;
				postWidth = Math.floor(portfolioWidth / columnNumb)			
				$(this).find('.item').each(function () { 
					$(this).css( { 
						width : postWidth - 20 + 'px',
						height : 'auto',
						margin : 10 + 'px' 
					});
					$('.no-gutter .'+$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : 'auto',
						margin : 0 + 'px' 
					});
					$('.wide.'+$(this).attr('class')).css( { 
						width : postWidth - 20 + 'px'  
					});
					$('.no-gutter .wide.'+$(this).attr('class')).css( { 
						width : postWidth + 'px'  
					});
					$('.tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.small.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
					$('.no-gutter .tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.wide-tall.'+$(this).attr('class')).css( {
						width : postWidth - 20 + 'px',
						height : postWidth   + 'px', 
					});
					$('.no-gutter .wide-tall.'+$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : postWidth   + 'px', 
					});
				});
				
				
			}
			
			else if (winWidth <= 479) {
				
				$('.portfolio-wrap').css( {width : container_mock});
				$('.portfolio-wrap.no-gutter').css( {width : container_mock});
				var portfolioWidth = $('.portfolio-wrap').width(),
				
				columnNumb = 1;
				postWidth = Math.floor(portfolioWidth / columnNumb)			
				$(this).find('.item').each(function () { 
					$(this).css( { 
						width : postWidth - 20 + 'px',
						height : 'auto',
						margin : 10 + 'px' 
					});
					$('.no-gutter .'+$(this).attr('class')).css( {
						width : postWidth  + 'px',
						height : 'auto',
						margin : 0 + 'px' 
					});
					$('.wide.'+$(this).attr('class')).css( { 
						width : postWidth - 20 + 'px'  
					});
					$('.no-gutter .wide.'+$(this).attr('class')).css( { 
						width : postWidth + 'px'  
					});
					$('.tall.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
					$('.small.'+$(this).attr('class')).css( {
						height : 'auto',  
					});
					$('.no-gutter .tall.'+$(this).attr('class')).css( {
						height : 'auto', 
					});
					$('.wide-tall.'+$(this).attr('class')).css( {
						width : postWidth - 20 + 'px',
						height : postWidth   + 'px',  
					});
					$('.no-gutter .wide-tall.'+$(this).attr('class')).css( {
						width : postWidth + 'px',
						height : postWidth   + 'px', 
					});
				});
				
				
			}		
			//alert();
			
			//return columnNumb;
		});
		$container.isotope({
			itemSelector: '.item',
			gutter:0,
			layoutMode: 'packery',
			transitionDuration: "0.8s"
		});		
	};
	/*On Resize Portfolio Function*/
}
/***** MasonryPortfolio function End *****/

/*****Ready function start*****/
$(document).ready(function(){
  matResume();
});
/*****Ready function end*****/

/***** Resize function start *****/
$(window).on("resize", function () {
	setHeightWidth();
	onResizePort();
}).resize();
/***** Resize function end *****/

/***** LightGallery init start *****/	
$(document).on('click', '#goto_box_1', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,		
        dynamicEl: [{
            "poster": 'img/gallery1.jpg',
			"html":'#video1',
            'subHtml': '<h4>Fading Light</h4><p>Classic view from Rigwood Jetty on Coniston Water an old archive shot similar to an old post but a little later on.</p>'
        }, {
            'src': 'img/gallery2.jpg',
            'subHtml': "<h4>Bowness Bay</h4><p>A beautiful Sunrise this morning taken En-route to Keswick not one as planned but I'm extremely happy I was passing the right place at the right time....</p>"
        }]
    })
 
});

$(document).on('click', '#goto_box_2', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,		
        dynamicEl: [{
            "poster": 'img/gallery2.jpg',
			"html":'#video1',
            'subHtml': '<h4>Fading Light</h4><p>Classic view from Rigwood Jetty on Coniston Water an old archive shot similar to an old post but a little later on.</p>'
        }]
    })
 
});

$(document).on('click', '#goto_box_3', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,
        dynamicEl: [{
            'src': 'img/gallery3.jpg',
            'subHtml': "<h4>Bowness Bay</h4><p>A beautiful Sunrise this morning taken En-route to Keswick not one as planned but I'm extremely happy I was passing the right place at the right time....</p>"
        }]
    })
 
});

$(document).on('click', '#goto_box_4', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,
        dynamicEl: [{
           
            'src': 'img/gallery4.jpg',
            'subHtml': "<h4>Bowness Bay</h4><p>A beautiful Sunrise this morning taken En-route to Keswick not one as planned but I'm extremely happy I was passing the right place at the right time....</p>"
        }, {
            'src': 'https://vimeo.com/1084537',
            'poster': 'img/gallery5.jpg',
            'subHtml': "<h4>Bowness Bay</h4><p>A beautiful Sunrise this morning taken En-route to Keswick not one as planned but I'm extremely happy I was passing the right place at the right time....</p>"
        }]
    })
 
});

$(document).on('click', '#goto_box_5', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,
        dynamicEl: [{
            "poster": 'img/gallery5.jpg',
			"html":'#video1',
            'subHtml': '<h4>Fading Light</h4><p>Classic view from Rigwood Jetty on Coniston Water an old archive shot similar to an old post but a little later on.</p>'
        }]
    })
 
});

$(document).on('click', '#goto_box_6', function (e) {
	e.preventDefault();
    $(this).lightGallery({
        dynamic: true,
		thumbnail: false,
		hash:false,
		autoplay:true,
        dynamicEl: [{
            'src': 'https://www.youtube.com/watch?v=Pq9yPrLWMyU',
            'poster': 'img/gallery6.jpg',
            'subHtml': "<h4>Coniston Calmness</h4><p>Beautiful morning</p>"
        }, {
            'src': 'img/gallery6.jpg',
            'subHtml': "<h4>Bowness Bay</h4><p>A beautiful Sunrise this morning taken En-route to Keswick not one as planned but I'm extremely happy I was passing the right place at the right time....</p>"
        }]
    })
 
});
/***** LightGallery init end*****/

/***** Availablity Calendar Start*****/
var d = new Date();
var n = d.getFullYear();
var notAvailableDates = ['01-05-'+n+'','01-02-'+n+'','01-12-'+n+'','01-01-2017'];
$('#datepicker1').datepicker({
	showAnim: 'show',
	dayNamesMin: [ "S", "M", "T", "W", "T", "F", "S" ],
	beforeShowDay: function(d) {
		var dmy = (d.getMonth()+1); 
		if(d.getMonth()<9) 
			dmy="0"+dmy;
		dmy+= "-"; 
		if(d.getDate()<10) dmy+="0"; 
			dmy+=d.getDate() + "-" + d.getFullYear(); 
			
		if ($.inArray(dmy, notAvailableDates) != -1) {
			return [false, "","notAvailableDates"]; 
		} else{
			 return [true,"","Available"]; 
		}
	}
});
$(document).on('click', '#datepickopn', function (e) {
	e.stopPropagation();
	$('.datepicker').toggleClass('datepicker-open');
	return;
});
$(document).on('click', 'body', function (e) {
    $('.datepicker').removeClass('datepicker-open');
	return;
});
/***** Availablity Calendar End*****/