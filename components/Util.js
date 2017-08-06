var Util = {}
Util.arrayPerform = function (arr) {
    return  arr.map(function (obj, i) {
        var rObj = {}
        rObj[obj.to] = obj;

        return rObj;
    });

}

module.exports = Util;