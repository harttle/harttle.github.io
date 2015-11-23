window.modules.follow = function(console, $ele, mod) {
    var tml =
        '<div class="modal fade"> ' +
        '  <div class="modal-dialog" style="width:180px"> ' +
        '    <div class="modal-content">' +
        '      <div class="modal-body"> ' +
        '      </div> ' +
        '    </div>' +
        '  </div> ' +
        '</div>',
        $modal = $(tml);

    var qrcode = new QRCode($modal.find('.modal-body').get(0), {
        text: location.href,
        width: 150,
        height: 150,
        colorDark : "#000000",
        colorLight : "#ffffff",
        correctLevel : QRCode.CorrectLevel.H
    });

    $modal.on('hidden.bs.modal', function() {
        $modal.remove();
    });

    $ele.find('.wechat a').click(function(){

        $modal.appendTo('body').modal('show');

        return false;
    });
};
