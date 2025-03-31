/* custom */

$('.owl-slide').owlCarousel({
    loop:true,
    items:1,
    margin:0,
    autoplay: true,
	autoplayTimeout: 4000,
	smartSpeed: 1000,
    dots:false,
    nav:true,
    navText: ["<i class='fa fa-chevron-left'></i>", "<i class='fa fa-chevron-right'></i>"],
    animateOut: 'fadeOut'
})

$('.owl-2').owlCarousel({
    loop:true,
    margin:30,
    nav:false,
    dots:true,
    autoplay: true,
    autoplayTimeout: 2000,
    smartSpeed: 1000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:2
        }
    }
})

$('.owl-3').owlCarousel({
    loop:true,
    margin:30,
    nav:false,
    dots:true,
    autoplay: true,
    autoplayTimeout: 2000,
    smartSpeed: 1000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:3
        }
    }
})

$('.owl-4').owlCarousel({
    loop:true,
    margin:30,
    nav:false,
    dots:true,
    autoplay: true,
    autoplayTimeout: 2000,
    smartSpeed: 1000,
    responsiveClass:true,
    responsive:{
        0:{
            items:1
        },
        600:{
            items:2
        },
        1000:{
            items:4
        }
    }
})

$('.owl-5').owlCarousel({
    loop:true,
    margin:15,
    nav:false,
    dots:true,
    autoplay: true,
	autoplayTimeout: 2000,
	smartSpeed: 1000,
    responsiveClass:true,
    responsive:{
        0:{
            items:2,
            margin:10
        },
        600:{
            items:3
        },
        1000:{
            items:5
        }
    }
})

$('#portfolio').magnificPopup({
    delegate: 'a',
    type: 'image',
    image: {
      cursor: null,
      titleSrc: 'title'
    },
    gallery: {
      enabled: true,
      preload: [0,1], // Will preload 0 - before current, and 1 after the current image
      navigateByImgClick: true
		}
});

//>> Wow Animation Start <<//
new WOW().init();

// aos js
$(function() {
    AOS.init();
});

//>> scroll to top <<//
$(window). scroll(function(){
    if ($(this). scrollTop() > 50) {
        $('.scrollToTop'). addClass('show');
    } else {
        $('.scrollToTop'). removeClass('show');
    }
});