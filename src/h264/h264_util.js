/**
 * Created by Luky on 2017/8/2.
 */

class Util{
    static ebsp2rbsp(src) {
        let src_length = src.length;
        let dst = Buffer.allocUnsafe(src_length);
        let dst_idx = 0;

        for (let i = 0; i < src_length; i++) {
            if (i >= 2) {
                // Unescape: Skip 0x03 after 00 00
                if (src[i] === 0x03 && src[i - 1] === 0x00 && src[i - 2] === 0x00) {
                    continue;
                }
            }
            dst[dst_idx] = src[i];
            dst_idx++;
        }
        return dst.slice(0, dst_idx);
    }
}

exports=module.exports=Util;