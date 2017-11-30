$(function () {
  $('body').on('click', 'a.animate', scrollTop)
  initScrollTopButton()

  function scrollTop () {
    $('html, body').stop().animate({
      scrollTop: $($(this).attr('href')).offset().top
    }, 500, 'swing')
    return false
  }

  function initScrollTopButton () {
    var $window = $(window)
    var topDistance = 300
    var shown = false
    var $btn = $('#site-scroll-top')
    $window.scroll(function () {
      if ($window.scrollTop() > topDistance) {
        if (!shown) {
          shown = true
          $btn.addClass('show')
        }
      } else if (shown) {
        $btn.removeClass('show')
        shown = false
      }
    })
  }
})
