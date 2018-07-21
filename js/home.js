$(function () {
  $(document).scroll(function () {
    var $nav = $(".chime-navbar");
    $nav.toggleClass('scrolled', $(this).scrollTop() > $nav.height());

    var $nav2 = $(".chime-nav-link");
    $nav2.toggleClass('scrolled', $(this).scrollTop() > $nav2.height());
  });
});

$('a[href^="#"]').on('click', function(event) {
    var target = $(this.getAttribute('href'));
    if( target.length ) {
        event.preventDefault();
        $('html, body').stop().animate({
            scrollTop: target.offset().top
        }, 1000);
    }
})
