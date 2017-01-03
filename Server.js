const net = require("net");
const url = require("url");
const fs = require("fs");
const escaper = require("./Tools/escape");

const PORT = 42069;

function log(message) {
    var timeStamp = "[ " + new Date().toISOString().replace("T", " / ").replace("Z", "") + " ] ";
    var result = "";
    const lines = message.split("\n");
    for (var i = 0; i < lines.length; i++) {
        if (i == 0) {
            result += timeStamp;
        }
        else {
            result += repeat(" ", timeStamp.length);
        }
        result += lines[i] + "\n";
    }
    console.log(result.trim());
}

function repeat(s, n) {
    return n == 0 ? "" : s + repeat(s, n - 1);
}

function serializeStory(story) {
    var storyParts = [];
    Object.keys(story).forEach(key => {
        
        storyParts.push(escaper.escapeJoin([
            key,
            story[key].text,
            escaper.escapeJoin(story[key].links.map(l => escaper.escapeJoin([l.link, l.story_id], ">")), "/")
        ], "|"));
    });
    var result = escaper.escapeJoin(storyParts, "\n");
    return result;
}

function saveStory(story, file) {
    const ser = serializeStory(story);
    fs.writeFile(file, ser, console.log);
}

function readStory(content) {
    var story = {};
    escaper.splitEscape(content, "\n").forEach(line => {
        const parts = escaper.splitEscape(line, "|");
        var story_id = parts[0];
        var text = parts[1];
        var links = escaper.splitEscape(parts[2], "/").map(link => {
            var linkParts = escaper.splitEscape(link, ">");
            return {link: linkParts[0], story_id: linkParts[1]};
        });
        story[story_id] = {text: text, links: links}
    });
    return story;
}

function readStoryFromFile(fileName) {
    var content = fs.readFileSync(fileName, "utf-8");
    return readStory(content);
}

const STORY_FILE = "Story.txt"

var STORY = readStoryFromFile(STORY_FILE); // Storyid: {text, links: [{link, story_id}, {link, story_id}, ...]}

/*
 * Client requests:
 * 
 * GET/[story_id] -- Gets text and links from a story id
 *  Response:
 *      [text]/[link1_text]>[link1_link]&[link2_text]>[link2_link]...
 *  Example:
 *      Client> GET/AT_HOME
 *      Server> U r at home/Go out>OUTSIDE&Die>DEAD
 */

var server = net.createServer((socket) => {
    log("Connected to " + socket.remoteAddress + ":" + socket.remotePort);
    socket.setEncoding("utf-8");

    socket.on("data", function(chunk) {
        log("Data: " + chunk);
        var send = "ERR/NOTHING";

        const parts = escaper.splitEscape(chunk, "/");

        if (parts[0] === "GET") {
            const story_id = parts[1].trim();
            if (Object.keys(STORY).indexOf(story_id) == -1) {
                send = "ERR/NOT_FOUND";
            }
            else {
                const story_part = STORY[story_id];
                var text = story_part.text;
                var links = escaper.escapeJoin(story_part.links.map(p => escaper.escapeJoin([p.link, p.story_id], ">")), "&");
                send = escaper.escapeJoin([text, links], "/");
            }
        }
        log("Seding " + send);
        socket.write(send + "\n");
    });
    socket.on("close", function(data) {
        log("Closed " + socket.remoteAddress + ":" + socket.remotePort + ". Data: " + data)
    });
});

var reader = setInterval(() => {
    var storyFromFile = readStoryFromFile(STORY_FILE);
    if (JSON.stringify(storyFromFile) !== JSON.stringify(STORY)) {
        log("Story file changed! Reloading!");
        STORY = storyFromFile;
    }
}, 1000);

server.listen(PORT);

log("Server started");
