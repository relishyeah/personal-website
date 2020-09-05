  
// Code By Webdevtrick ( https://webdevtrick.com )
var $header_top = $('.header-top');
var $nav = $('nav');
 
$header_top.find('a').on('click', function() {
  $(this).parent().toggleClass('open-menu');
});
 
$('#fullpage').fullpage({
  sectionsColor: ['#20A4F3', '#839788', '#347FC4', '#B02E0C'],
  sectionSelector: '.vertical-scrolling',
  navigation: true,
  slidesNavigation: true,
  controlArrows: false,
  anchors: ['Home', 'Resume', 'Projects', 'Contact'],
  menu: '#menu',
 
  afterLoad: function(anchorLink, index) {
    $header_top.css('background', 'rgba(0, 47, 77, .3)');
    $nav.css('background', 'rgba(0, 47, 77, .25)');
    if (index == 4) {
        $('#fp-nav').hide();
      }
  },
 
  onLeave: function(index, nextIndex, direction) {
    if(index == 4) {
      $('#fp-nav').show();
    }
  },
 
 
});
