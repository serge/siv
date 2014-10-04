var ee = require('easyimage');

function convert(path, len, output) {

    function get_thumb(info) {
        var w = info.width, h = info.height;
        var nh, nw;
        if (w > h) {
            nh = len * h / w;
            nw = len;
        } else {
            nw = len * w / h;
            nh = len;
        }
        return ee.thumbnail({
            src:path,
            dst:output,
            width:  nw,
            height: nh
        });
    }

    return ee.info(path).then(get_thumb);
}

exports.convert = convert;
