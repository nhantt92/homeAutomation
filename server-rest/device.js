module.exports = function (Home) {
    var fs = require("fs");

    function getTerminals(userId, callback) {
        Home.find({ residents: userId }).lean().exec(function (err, homes) {
            if(err) {
                callback(err);
            } else {
                var terminalList = [];
                for(var homeIndex in homes) {
                    var rooms = homes[homeIndex].rooms;
                    for(var roomIndex in rooms) {
                        var sortedTerminals = rooms[roomIndex].terminals.sort(function (a, b) {
                            var timeOrder = (a.created - b.created);
                            return (a.linked ? (b.linked ? timeOrder : 1) : (b.linked ? -1 : timeOrder));
                        });
                        for(var terminalIndex in sortedTerminals) {
                            var terminal = sortedTerminals[terminalIndex];
                            terminal.terminalId = terminal._id;
                            terminal.roomId = rooms[roomIndex]._id;
                            terminal.homeId = homes[homeIndex]._id;
                            terminal.parentage = "Terminal (" + terminal.terminalName + ") is a " + terminal.type + " in Room (" + rooms[roomIndex].roomName + ") in Home (" + homes[homeIndex].homeName + ")";
                            terminalList.push(terminal);
                        }
                    }
                }
                callback(null, terminalList);
            }
        });
    }

    function getFirmware(callback) {
        var fileContents = "";
        var fileStream = fs.ReadStream("firmware/firmware.min.js");
        fileStream.on("data", function (data) {
            fileContents += data;
        });
        fileStream.on("end", function (data) {
            callback({ "firmware" : fileContents });
        });
    }

    return {
        getTerminals: getTerminals,
        getFirmware: getFirmware
    }
};
