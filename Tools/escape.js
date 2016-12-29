

// Bug:
//  splitEscape(escapeJoin(["Hello", "||World"], "|"), "|") -> ["Hello||", "World"]
//  Should be ["Hello", "||World"]
// Will fix later

function _escape(text, escaper) {
	var out = "";
	for (var i = 0; i < text.length; i++) {
		var c = text[i];
		if (c === escaper) {
			out += c + c;
		}
		else {
			out += c;
		}
	}
	return out;
}
function escapeJoin(lst, escaper) {
    var out = "";
    for (var i = 0; i < lst.length; i++) {
        if (i != 0) {
            out += escaper;
        }
        out += _escape(lst[i], escaper);
    }
    return out;
}

function _unEscape(text, escaper) {
	var out = "";
	var escaped = false;
	for (var i = 0; i < text.length; i++) {
		var c = text[i];
		if (escaped) {
			out += c;
			escaped = false;
		} else if (c === escaper) {
			escaped = true;
		} else
			out += c;
	}
	return out;
}

function splitEscape(text, escaper) {
	out = [ "" ];
	var escaped = false;
	for (var i = 0; i < text.length; i++) {
		var c = text[i];
		if (escaped && c != escaper) {
			out.push(c);
			escaped = false;
		} else if (c != escaper) {
			out[out.length - 1] += c;
		}
		if (c == escaper) {
			if (escaped) {
				escaped = false;
				out[out.length - 1] += c;
				escaped = false;
			} else
				escaped = true;
		}
	}
	return out;
}

exports.escapeJoin = escapeJoin;
exports.splitEscape = splitEscape;
exports._escape = _escape;
exports._unEscape = _unEscape;
