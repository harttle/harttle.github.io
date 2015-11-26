window.modules.follow = function(console, $ele, mod) {
    var tml =
        '<div class="modal fade"> ' +
        '  <div class="modal-dialog" style="width:286px"> ' +
        '    <div class="modal-content">' +
        '      <div class="modal-header" style="padding: 10px 15px;">' +
        '        <button type="button" class="close" data-dismiss="modal">' +
        '          <span>&times;</span></button>' +
        '        <h4 class="modal-title">分享链接</h4>' +
        '      </div>' +
        '      <div class="modal-body"> ' +
        '      </div> ' +
        '    </div>' +
        '  </div> ' +
        '</div>',
        $modal = $(tml);

    var qrcode = new QRCode($modal.find('.modal-body').get(0), {
        text: location.href,
        width: 256,
        height: 256,
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
