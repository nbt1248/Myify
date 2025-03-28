function setTip(obj, text, interactive=false) {
	tippy(obj, {
		content: `<text style="font-size: 11px;">${text}</text>`,
		allowHTML: true,
		placement: 'top',
		theme: 'light vk',
		animation: 'shift-away',
		interactive: interactive
	});
}
let friendson;
async function updateOnline() {
	friendson = (await window.OVKAPI.call("friends.get", {"user_id": window.openvk.current_id, "count": 99999})).items.filter(user => user.online === 1).length
	if (Number(friendson) > 0) {
		if (Number(friendson) > 99) {
			document.querySelector('.friends_online').textContent = "99+"
		} else {
			document.querySelector('.friends_online').textContent = friendson
		}
		document.querySelector('.friendslink').style.display = "block";
	} else {
		document.querySelector('.friendslink').style.display = "none";
	}
}
updateOnline();
setInterval(() => updateOnline(), 300000);

window.player.ajCreate = function() {
	const previous_time_x = localStorage.getItem('audio.lastX') ?? 100
	const previous_time_y = localStorage.getItem('audio.lastY') ?? scrollY
	const miniplayer_template = u(`
		<div id='ajax_audio_player' class='ctx_place'>
			<div id="aj_player">
				<div id="aj_player_internal_controls">
					<div id="aj_player_play">
						<div id="aj_player_play_btn" class="paused"></div>
					</div>
					<div id="aj_player_track" style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis;transform: translateY(-2px);">
						<div id="aj_player_track_name">
							<a id="aj_player_track_title" class="noOverflow" style="max-width: 300px;user-select: none;cursor: unset;">
								<b>Unknown</b>
								<br>
								<span>Untitled</span>
							</a>
						</div>
					</div>
				  </div>
				<div id="aj_player_close_btn"></div>
			</div>
		</div>
	`)
	u('body').append(miniplayer_template)
	miniplayer_template.attr('style', `left:${previous_time_x}px;top:${previous_time_y}px`)
	miniplayer_template.find('#aj_player_close_btn').on('click', (e) => {
		this.ajClose()
	})
	$('#ajax_audio_player').draggable({
		cursor: 'grabbing', 
		containment: 'window',
		cancel: '#aj_player_track .selectableTrack, #aj_player_volume .selectableTrack, #aj_player_buttons',
		stop: function(e) {
			if(window.player.ajaxPlayer.length > 0) {
				const left = parseInt(window.player.ajaxPlayer.nodes[0].style.left)
				const top  = parseInt(window.player.ajaxPlayer.nodes[0].style.top)

				localStorage.setItem('audio.lastX', left)
				localStorage.setItem('audio.lastY', top)
			}
		}
	})
}

window.addEventListener('load', () => {document.querySelector('#searchBoxFastTips').innerHTML = `<div class="fastpreload"></div>`;});
function stataj() {
    function statAjPlayer() {
        const header = document.querySelector('.page_header');
        const ajPlayer = document.getElementById('ajax_audio_player');
        const headerRect = header.getBoundingClientRect();
        const headerBottomRightX = headerRect.right;
		const ajplayerscr = document.createElement("style");
		ajplayerscr.type = 'text/css';
		ajplayerscr.textContent = `.scrolled #ajax_audio_player {top: 15px !important;}`;
		document.head.appendChild(ajplayerscr);
        if (document.documentElement.clientWidth - header.getBoundingClientRect().right < 170) {
            document.querySelector('#ajax_audio_player').style = `left: ${headerBottomRightX - 815}px;top: ${document.documentElement.clientHeight - 50}px;`;
            ajplayerscr.textContent = `.scrolled #ajax_audio_player {top: ${document.documentElement.clientHeight - 50}px !important;}`;
            localStorage.setItem('audio.lastX', headerBottomRightX - 815);
        } else {
            document.querySelector('#ajax_audio_player').style = `left: ${headerBottomRightX + 2}px;top: 49px;`;
            ajplayerscr.textContent = `.scrolled #ajax_audio_player {top: 15px !important;}`;
            localStorage.setItem('audio.lastX', headerBottomRightX + 2);
        }
    }
    statAjPlayer();
    window.addEventListener('load', statAjPlayer);
    window.addEventListener('load', () => {document.querySelector('#searchBoxFastTips').innerHTML = `<div class="fastpreload"></div>`;});
    window.addEventListener('resize', statAjPlayer);
    $('#ajax_audio_player').draggable("destroy")
}
if (document.getElementById('ajax_audio_player')) {
    stataj();
} else {
    const observer = new MutationObserver((mutationsList, observer) => {
        const element = document.querySelector('#ajax_audio_player');
        if (element) {
            stataj();
            observer.disconnect();
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
    });
}

async function loadMoreAudio() {
    if (window.musHtml) {
        window.musHtml.querySelector('.audiosContainer .loadMore').innerHTML = `<img src="data:image/gif;base64,R0lGODlhIAAIAKECAEVojoSctMHN2QAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAIAAIAAACFZyPqcvtD6KMr445LcRUN9554kiSBQAh+QQFCgADACwCAAIAEgAEAAACD4xvM8DNiJRz8Mj5ari4AAAh+QQFCgADACwCAAIAHAAEAAACGJRvM8HNCqKMCCnn4JT1XPwMG9cJH6iNBQAh+QQFCgADACwMAAIAEgAEAAACD5RvM8HNiJRz8Mj5qri4AAAh+QQFCgADACwWAAIACAAEAAACBZSPqYsFACH5BAUUAAMALAAAAAAgAAgAAAIOnI+py+0Po5y02ouzPgUAOw==" />`;
        await window.player.loadContext(Number(Math.max(...window.player.context["playedPages"])) + 1, true);
        window.player.dump();
        let parsedaud = parseAudio(true).scrollContainer;
        let tmp = document.createElement('div');
        tmp.innerHTML = parsedaud;
        window.musHtml.querySelectorAll('.scroll_container .scroll_node [data-realid]').forEach(scrollNode => {
            const realId = scrollNode.getAttribute('data-realid');
            tmp.querySelectorAll('.scroll_node [data-realid]').forEach(node => {
                if (node.getAttribute('data-realid') === realId) node.closest('.scroll_node').remove();
            });
        });
        parsedaud = tmp.innerHTML;
        window.musHtml.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer .loadMore_node').outerHTML = parsedaud;
        window.musHtml.querySelector('.loadMore').onclick = async function() {await loadMoreAudio();}
        u(`.audiosContainer .audioEmbed .audioEntry, .audios_padding .audioEmbed`).removeClass('nowPlaying');
        u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying');
    }
}

function cleanUpAudioList() {
    let ldump = localStorage.getItem('audio.lastDump');
    if (ldump) {
        let data = JSON.parse(ldump);
        if (data.tracks && data.tracks.length > 20) {
            data.tracks = data.tracks.slice(-20);
            localStorage.setItem('audio.lastDump', JSON.stringify(data));
            console.log('playlist context cleaned up!');
        }
    }
}

function parseAudio(onlyscnodes = false) {
    cleanUpAudioList();
    const audioDump = localStorage.getItem('audio.lastDump');
    const nothingtemplate = `<div class="vkifytracksplaceholder" style=""><center style="background: white;border: #DEDEDE solid 1px;font-size: 11px;margin-top: 9px;margin-bottom: 3px;height: 362px;width: 430px;">
                                <span style="color: #707070;margin: 172px 0;display: block;">
                                    ${tr('no_data_description')}
                                </span>
                            </center></div>`
    if (audioDump) {
        try {
            if (JSON.parse(audioDump)) {
            let adump = JSON.parse(audioDump);
            adump.tracks = Array.from(new Map(adump.tracks.map(track => [track.id, track])).values());
            const scrollContainer = document.createElement('div');
            scrollContainer.classList.add('scroll_container');
            adump.tracks.forEach(track => {
                const scrollNode = document.createElement('div');
                scrollNode.classList.add('scroll_node');
                scrollNode.innerHTML = `
                <div id="audioEmbed-${track.id}" data-realid="${track.id}" data-name="${track.performer} — ${track.name}" data-genre="Other" data-length="${track.length}" data-keys='${JSON.stringify(track.keys)}' data-url="${track.url}" class="audioEmbed ctx_place">
                    <audio class="audio"></audio>
                    <div id="miniplayer" class="audioEntry">
                        <div class="audioEntryWrapper" draggable="true">
                            <div class="playerButton">
                                <div class="playIcon"></div>
                            </div>
                            <div class="status">
                                <div class="mediaInfo noOverflow">
                                    <div class="info">
                                        <strong class="performer">
                                            <a draggable="false" href="/search?section=audios&amp;order=listens&amp;only_performers=on&amp;q=${encodeURIComponent(track.performer)}">${track.performer}</a>
                                        </strong>
                                        —
                                        <span draggable="false" class="title">${track.name}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="mini_timer">
                                <span class="nobold hideOnHover" data-unformatted="${track.length}">${formatTime(track.length)}</span>
                                <div class="buttons">
                                    <div class="report-icon musicIcon" data-id="6690"></div>
                                    <div class="remove-icon musicIcon" data-id="${track.id}"></div>
                                    <div class="add-icon-group musicIcon hidden" data-id="${track.id}"></div>
                                </div>
                            </div>
                        </div>
                        <div class="subTracks" draggable="false">
                            <div class="lengthTrackWrapper">
                                <div class="track lengthTrack">
                                    <div class="selectableTrack">
                                        <div class="selectableTrackLoadProgress">
                                            <div class="load_bar"></div>
                                        </div>
                                        <div class="selectableTrackSlider">
                                            <div class="slider"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="volumeTrackWrapper">
                                <div class="track volumeTrack">
                                    <div class="selectableTrack">
                                        <div class="selectableTrackSlider">
                                            <div class="slider"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
                scrollContainer.appendChild(scrollNode);
            });
            if (scrollContainer.innerHTML) {
            const loadmore = document.createElement('div');
            loadmore.classList.add('scroll_node');
            loadmore.classList.add('loadMore_node');
            loadmore.innerHTML = `<a class="loadMore">${window.vkifylang.loadmore}</a>`
            scrollContainer.appendChild(loadmore);
            if (onlyscnodes) {
                return {'scrollContainer': `${scrollContainer.innerHTML}`, 'nowPlayingUrl': adump.context.object.url};
            } else {
                return {'scrollContainer': `<div class="audiosContainer audiosSideContainer audiosPaddingContainer">
                        <div class="scroll_container">
                            ${scrollContainer.innerHTML}
                        </div>
                    </div>`, 'nowPlayingUrl': adump.context.object.url};
            }
            } else {
            return {'scrollContainer': nothingtemplate, 'nowPlayingUrl': ''}
            }
          }
        } catch (error) {
            console.error(error)
            return {'scrollContainer': nothingtemplate, 'nowPlayingUrl': ''}
        }
    } else {
        return {'scrollContainer': nothingtemplate, 'nowPlayingUrl': ''}
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return {'scrollContainer': nothingtemplate, 'nowPlayingUrl': ''}
}

const vkfavicon = {
    "fav": "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAJxzUCCgd1N5pn5a/6d+W/+fdlKkAAAAAJtyTw6fdlJzpX1Z56Z+Wv+cc1CqAAAAAAAAAAAAAAAAAAAAAJ10UTalfFjRrIRf/6+HYv+vh2L/qYFc/6F4VDiielaYqoFd/66GYf+shF//nnVS/wAAAAAAAAAAAAAAAJ10UUSnflrtroZh/7CIY/+wiGP/sIhj/66GYf+shF/wrYVg/6+HYv+thWD/pHtX/5VsSpEAAAAAAAAAAJxzUDGnflrzroZh/7CIY/+wiGP/sIhj/7CIY/+wiGP/sIhj/7CIY/+wiGP/qIBb/5lwTZuTaUcMAAAAAJpxTiGkfFjUrYVg/66GYf+shF//r4di/7CIY/+wiGP/r4di/6yEX/+vh2L/r4di/6Z9WuMAAAAAAAAAAAAAAACfdlKFq4Ne/66GYf+of1v/pXtY2KuDXv+wiGP/sIhj/6uDXv+lfVnYqYFd/66GYf+qgV3snXRQPgAAAACacU4vp35a7a+HYv+rg17/nnZTzZpyTyqnf1r/sIhj/7CIY/+nf1r/m3JPKqF3VOuthGD/roZh/6V9WOOacU4vnXRRlKyDX/+vh2L/p35a/5huTFsAAAAAp39a/7CIY/+vh2L/pHxX/wAAAACWbUt4p39a/6+HYv+sg1//nXRRlJ10UfmpgFz/qYBc/511Uv+WbUoGmXBNTKd9Wv+rg17/qoFd/552UvgAAAAAlGtICJ51Uv+pgFz/qYBc/510UfmUa0ismnFO+plvTduUakhyAAAAAJVrSd2bck76nXNQ+ppxTvGUa0icAAAAAAAAAACUakhmmW9N45pxTvqUa0iiAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA//8AAP//AAD//wAA+CAAAPAAAADgAAAAwAAAAIADAACAAQAAAAAAAAQgAAAAIAAACDAAAP//AAD//wAA//8AAA==",
	"fav_im": "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAACrglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzEq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz//////7+ghP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc////////////v6CE/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz///////////////////////////////////////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc////////////////////////////////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP///////////////////////////////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz///////////////////////////////////////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc////////////////////////////////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP///////////////////////////////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDAAA+LwAAc3QAAHQ6AABhbgAAZD4AACAgAAAgIAAAICAAACAgAAByZAAAbGkAACAgAAAgIAAAICAAADwvAABmOg==",
    "playiconnew": "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAACrglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzEq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz///////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP//////////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz///////////////////////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc////////////////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP//////////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDAAAvkQAAL/4AADBsAAAw2wAAMUoAADG6AAAyKgAAMpsAADMNAAAzfwAAM/EAADRlAAA02AAANU0AADXCAAA2Nw==",
    "pauseiconnew": "data:image/x-icon;base64,AAABAAEAEBAAAAEAIABoBAAAFgAAACgAAAAQAAAAIAAAAAEAIAAAAAAAQAQAABMLAAATCwAAAAAAAAAAAACrglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzEq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/////////////////6uCXP+rglz/////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP////////////////+rglz/q4Jc/////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/////////////////q4Jc/6uCXP////////////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/////////////////6uCXP+rglz/////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP////////////////+rglz/q4Jc/////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/////////////////q4Jc/6uCXP////////////////+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/////////////////6uCXP+rglz/////////////////q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP////////////////+rglz/q4Jc/////////////////6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDq4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglz/q4Jc/6uCXP+rglzDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="
}

if (window.location.href.includes('im?sel=')) {
    document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["fav_im"])
}

window.initVKGraffiti = function(event) {
	var msgbox = new CMessageBox({
		title: tr("draw_graffiti"),
 		body: `<iframe style="width: 100%; height: 100%; border: medium;" srcdoc="
<!DOCTYPE html>
<html lang=&quot;en&quot;>
<head>
    <meta charset=&quot;UTF-8&quot;>
    <meta name=&quot;viewport&quot; content=&quot;width=device-width, initial-scale=1.0&quot;>
    <link rel=&quot;stylesheet&quot; href=&quot;${window.location.origin + "/themepack/vkify/2.0.0.0/resource/vkgraffiti/graffiti.css"}&quot;>
    <link rel=&quot;stylesheet&quot; href=&quot;${window.location.origin + "/themepack/vkify/2.0.0.0/resource/vkgraffiti/common.css"}&quot;>
</head>
<body>
    <div style=&quot;margin: 10px&quot;><a onclick=&quot;Graffiti.flushHistory();&quot;>${window.vkifylang.graffitiflushhistory}</a> | <a onclick=&quot;Graffiti.backHistory();&quot;>${window.vkifylang.graffitibackhistory}</a></div>
    <div style=&quot;background-color: #F7F7F7; padding-top: 20px; padding-bottom: 1px;&quot;>
        <div id=&quot;graffiti_aligner&quot;>
            <canvas id=&quot;graffiti_common&quot; width=&quot;586&quot; height=&quot;293&quot;></canvas>
            <canvas id=&quot;graffiti_overlay&quot; width=&quot;586&quot; height=&quot;293&quot;></canvas>
            <canvas id=&quot;graffiti_helper&quot; width=&quot;586&quot; height=&quot;293&quot;></canvas>
        </div>
        <div id=&quot;graffiti_resizer&quot; style=&quot;margin-top: 5px;&quot;></div>
    </div>
    <div>
        <canvas id=&quot;graffiti_controls&quot; width=&quot;586&quot; height=&quot;70&quot;></canvas>
    </div>
    <canvas id=&quot;graffiti_hist_helper&quot; width=&quot;1172&quot; height=&quot;586&quot; style=&quot;display:none;&quot;></canvas>
    <div id=&quot;graffiti_cpwrap&quot; style=&quot;display:none; top:-210px;&quot;>
        <canvas id=&quot;graffiti_cpicker&quot; width=&quot;252&quot; height=&quot;168&quot;></canvas>
    </div>
    <script src=&quot;${window.location.origin + "/themepack/vkify/2.0.0.0/resource/vkgraffiti/graffiti.js"}&quot;></script>
    <script>
        var cur = {&quot;lang&quot;: {&quot;graffiti_flash_color&quot;: &quot;${window.vkifylang.graffiticolor} &quot;, &quot;graffiti_flash_opacity&quot;: &quot;${window.vkifylang.graffitiopacity} &quot;, &quot;graffiti_flash_thickness&quot;: &quot;${window.vkifylang.graffitithickness} &quot;, &quot;graffiti_normal_size&quot;: &quot;Оконный режим&quot;, &quot;graffiti_full_screen&quot;: &quot;Полноэкранный режим&quot;}}; /* последние два не используются, так что пока нет смысла переводить */
        window.onload = function() {
            Graffiti.init();
        };
    </script>
</body>
</html>
"></iframe>`,
            		close_on_buttons: false,
            		warn_on_exit: true,
            		buttons: [tr("save"), tr("cancel")],
            		callbacks: [function() {
            			msgbox.getNode().find('iframe').nodes[0].contentWindow.Graffiti.getImage(function(dataURL) {
            				// ваще кому нужен этот комментарий лол
            				var blob = dataURLtoBlob(dataURL);
            				let fName = "Graffiti-" + Math.ceil(performance.now()).toString() + ".jpeg";
            				let image = new File([blob], fName, {
            					type: "image/jpeg",
            					lastModified: new Date().getTime()
            				});
            				__uploadToTextarea(image, u(event.target).closest('#write'))
            			});
            			msgbox.close()
            		}, async function() {
            			const res = await msgbox.__showCloseConfirmationDialog()
            			if (res === true) {
            				msgbox.close()
            			}
            		}]
            	})
            	var msgboxsel = document.querySelector(`.ovk-diag-cont.ovk-msg-all[data-id="${msgbox.id}"]`)
            	msgboxsel.style.width = '800px';
            	msgbox.getNode().find('.ovk-diag-body').attr('style', 'height:550px;')

            	function dataURLtoBlob(dataURL) {
            		var arr = dataURL.split(','),
            			mime = arr[0].match(/:(.*?);/)[1],
            			bstr = atob(arr[1]),
            			n = bstr.length,
            			u8arr = new Uint8Array(n);
            		while (n--) {
            			u8arr[n] = bstr.charCodeAt(n);
            		}
            		return new Blob([u8arr], {
            			type: mime
   		});
	}
};

window.toggle_comment_textarea = function(id) {
    var el = document.getElementById('commentTextArea'+id);
    var wi = document.getElementById('wall-post-input'+id);
		if (el.style.display === "block") {
    	el.style.display = "none";
    	wi.blur();
    } else {
  	  el.style.display = "block";
  	  wi.focus();
		}
}

$(document).ready(function() {
  $(document).on('mousedown focus click', 'select', function(e) {
    e.preventDefault();
    showCustomMenu($(this));
  });
  
  function showCustomMenu($select) {
    $('.vkdropdown').remove();
    const rect = $select[0].getBoundingClientRect();
    const $menu = $('<div class="vkdropdown">')
      .css({
        position: 'absolute',
        left: (rect.left + scrollX - 1) + 'px',
        top: (rect.bottom + scrollY - 2) + 'px',
        width: rect.width + 'px',
        background: '#fff',
        border: '1px solid #ddd',
        'z-index': 9999,
        'max-height': '200px',
        'overflow-y': 'auto'
      })
      .appendTo('body');

    $select.find('option').each(function() {
      const $option = $(this);
      $('<div class="vkdropopt">')
        .text($option.text())
        .toggleClass('selected', $option.prop('selected'))
        .appendTo($menu);
    });

    $menu.on('click', '.vkdropopt', function() {
      const index = $(this).index();
	  $select.find('option').eq(index).prop('selected', true)
	  /* jquery для лохов */
	  $select[0].dispatchEvent(new Event('change', { bubbles: true }));
      $menu.remove();
    });

    setTimeout(() => {
      $(document).one('click', function(e) {
        if (!$(e.target).closest('.vkdropdown').length) {
          $menu.remove();
        }
      });
    }, 0);
  }
});

window.addEventListener('DOMContentLoaded', async () => {
$(document).on('mouseenter', '.menu_toggler_vkify', function(e) {
    const post_buttons = $(e.target).closest('.post-buttons')
    const wall_attachment_menu = post_buttons.find('#wallAttachmentMenu')
    if(wall_attachment_menu.is('.hidden')) {
        wall_attachment_menu.css({ opacity: 0 });
        wall_attachment_menu.toggleClass('hidden').fadeTo(250, 1);
		wall_attachment_menu.addClass('small');
    }
});
$(document).on('mouseenter', '#wallAttachmentMenu #__audioAttachment', function(e) {
    const wall_attachment_menu = $(e.target).closest('#wallAttachmentMenu')
	wall_attachment_menu.addClass('full');
});
$(document).on('mouseleave', '#wallAttachmentMenu', function(e) {
    const wall_attachment_menu = $(e.target).closest('#wallAttachmentMenu')
    if(!wall_attachment_menu.is('.hidden')) {
		wall_attachment_menu.fadeTo(250, 0, function () {
			$(this).toggleClass('hidden');
			wall_attachment_menu.removeClass('full');
			wall_attachment_menu.removeClass('small');
		});
    }
});

window.vkifyGraffiti = function(e) {
	if (localStorage.getItem('vkify.graffitiType') == "1") {
		window.initVKGraffiti(e);
	} else {
		initGraffiti(e)
	}
}

player.__setFavicon = function (state = 'playing') {
    if(state == 'playing') {
        document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["playiconnew"])
    } else {
        document.querySelector('link[rel="icon"], link[rel="shortcut icon"]').setAttribute("href", vkfavicon["pauseiconnew"])
	}
}

const originalInitEvents = window.player.initEvents;
window.player.initEvents = function() {
    originalInitEvents.call(this);
    this.audioPlayer.ontimeupdate = () => {
        const current_track = this.currentTrack;
        if (!current_track) {
            return;
        }
        /* я не умею считать так что пусть будет пиксель пёрфект) */
        const time = this.audioPlayer.currentTime;
        const ps = ((time * 104) / current_track.length).toFixed(3);
        this.uiPlayer.find(".time").html(fmtTime(time));
        this.__updateTime(time);

        if (ps <= 104) {
            this.uiPlayer.find(".track .selectableTrack .slider").attr('style', `padding-left:${ps}%`);

            if (this.linkedInlinePlayer) {
                this.linkedInlinePlayer.find(".subTracks .lengthTrackWrapper .slider").attr('style', `padding-left:${ps}%`);
                this.linkedInlinePlayer.find('.mini_timer .nobold').html(fmtTime(time));
            }

            if (this.ajaxPlayer) {
                this.ajaxPlayer.find('#aj_player_track_length .slider').attr('style', `padding-left:${ps}%`);
                this.ajaxPlayer.find('#aj_player_track_name #aj_time').html(fmtTime(time));
            }
        }
    };
    this.audioPlayer.onvolumechange = () => {
        const volume = this.audioPlayer.volume;
        const ps = Math.ceil((volume * 132) / 1);

        if (ps <= 132) {
            this.uiPlayer.find(".volumePanel .selectableTrack .slider").attr('style', `padding-left:${ps}%`);

            if (this.linkedInlinePlayer) {
                this.linkedInlinePlayer.find(".subTracks .volumeTrackWrapper .slider").attr('style', `padding-left:${ps}%`);
            }

            if (this.ajaxPlayer) {
                this.ajaxPlayer.find('#aj_player_volume .slider').attr('style', `padding-left:${ps}%`);
            }
        }

        localStorage.setItem('audio.volume', volume);
    };
};
window.player.initEvents();

const headerMusicBtn = document.querySelector('.headerMusicBtn');

if (headerMusicBtn) {
    headerMusicBtn.addEventListener('click', function() {
        if (headerMusicBtn.classList.contains('paused')) {
            window.player.play();
            headerMusicBtn.classList.remove('paused');
        } else {
            window.player.pause();
            headerMusicBtn.classList.add('paused');
        }
    });
}

if (window.player && window.player.audioPlayer) {
	const headerMusicBtn = document.querySelector('.headerMusicBtn');
    setInterval(() => {
        const nowplaying = document.querySelectorAll('.audioEntry.nowPlaying');
        if (window.player.is_closed == true) {
            headerMusicBtn.classList.add('closed');
			document.querySelector('#headerMusicLinkDiv a').style.color = "rgb(218, 225, 232)"
            if (nowplaying) {nowplaying.forEach(btn => {btn.classList.remove('nowPaused')})};
        }
        if (window.player.audioPlayer.paused == true) {
            headerMusicBtn.classList.add('paused');
			document.querySelector('#headerMusicLinkDiv a').style.color = "rgb(218, 225, 232)"
            if (nowplaying) {nowplaying.forEach(btn => {btn.classList.add('nowPaused')})};
        }
        else {
            headerMusicBtn.classList.remove('paused');
			document.querySelector('#headerMusicLinkDiv a').style.color = "#FFF"
            if (nowplaying) {nowplaying.forEach(btn => {btn.classList.remove('nowPaused')})};
        }
    }, 50);
}
const friendsd = await window.OVKAPI.call("friends.get", {"user_id": window.openvk.current_id, "fields": "first_name,last_name,photo_50", "count": 100})
const friendsmap = friendsd.items
.slice(0, friendsd.count)
.map(item => ({
   id: item.id,
   photo_50: item.photo_50,
   first_name: item.first_name,
   last_name: item.last_name
}));
let friendshtml = ''
friendsmap.forEach((user, index) => {
   friendshtml += `
    <a onclick="tippy.hideAll();" href="/audios${user.id}">
        <div class="elem">
            <img src="${user.photo_50}">
            <div class="additionalInfo">
                <span class="name noOverflow">${escapeHtml(user.first_name)} ${escapeHtml(user.last_name)}</span>
            </div>
        </div>
    </a>
  `;
});

const mushtml = `
<div style="" class="rightlist">
    <div class="verticalGrayTabs">
        <div class="with_padding">
            <a onclick="tippy.hideAll();" href="/audios${window.openvk.current_id}">${tr('my_music')}</a>
            <a onclick="tippy.hideAll();" href="/player/upload">${tr('upload_audio')}</a>
            <a onclick="tippy.hideAll();" href="/search?section=audios" id="ki">${tr('audio_new')}</a>
            <a onclick="tippy.hideAll();" href="/search?section=audios&order=listens" id="ki">${tr('audio_popular')}</a>
            <hr>
            <a onclick="tippy.hideAll();" href="/playlists${window.openvk.current_id}" id="ki">${tr('my_playlists')}</a>
            <a onclick="tippy.hideAll();" href="/audios/newPlaylist">${tr('new_playlist')}</a>
        </div>
        <div class="friendsAudiosList">
        ${friendshtml}
        </div>
    </div>
</div>
<div class="bigPlayer ctx_place">
    <div class="bigPlayerWrapper">
        <div class="playButtons">
            <div onmousedown="this.classList.add('pressed')" onmouseup="this.classList.remove('pressed')" class="playButton musicIcon" data-tip="simple" data-title=`+tr('play_tip')+`></div>
            <div class="arrowsButtons">
                <div class="nextButton musicIcon" data-tip="simple" data-title="?"></div>
                <div class="backButton musicIcon" data-tip="simple" data-title="?"></div>
            </div>
        </div>

        <div class="trackPanel">
            <div class="trackInfo">
                <div class="trackName">
                    <span class="trackPerformers"><a href="/">?</a></span> —
                    <span>?</span>
                </div>

                <div class="timer">
                    <span class="time">00:00</span>
                    <span>/</span>
                    <span class="elapsedTime">-00:00</span>
                </div>
            </div>

            <div class="track">
                <div class="selectableTrack">
                    <div id="bigPlayerLengthSliderWrapper">&nbsp;
                        <div class="slider"></div>
                    </div>
                    <div class="selectableTrackLoadProgress">
                        <div class="load_bar"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="volumePanel">
            <div class="volumePanelTrack">
                <div class="selectableTrack">
                    <div id="bigPlayerVolumeSliderWrapper">&nbsp;
                        <div class="slider" style="padding-left:122%"></div>
                    </div>
                </div>
            </div>
        </div>

        <div class="additionalButtons">
            <div class="repeatButton musicIcon" data-tip="simple" data-title=`+tr('repeat_tip')+`></div>
            <div class="shuffleButton musicIcon" data-tip="simple" data-title=`+tr('shuffle_tip')+`></div>
            <div class="deviceButton musicIcon" data-tip="simple" data-title=`+tr('mute_tip')+`></div>
        </div>
    </div>
</div>
<div class="vkifytracksplaceholder"></div>
    <div class="musfooter"><span class="playingNow"></span>
    <input onclick="tippy.hideAll();" value="${tr('close')}" class="button" type="submit">
</div>
`

tippy(document.querySelector('#headerMusicLinkDiv'), {
content: mushtml,
allowHTML: true,
trigger: 'click',
interactive: true,
placement: 'bottom',
theme: 'musicpopup',
width: 627,
arrow: true,
getReferenceClientRect: () => document.querySelector('#headerMusicBtn').getBoundingClientRect(),
maxWidth: 627,
offset: [-185, 17],
appendTo: document.body,
onHidden(instance) {
   window.musHtml = undefined;
},
async onMount(instance) {
window.musHtml = instance.popper;
   const placeholder = instance.popper.querySelector('.vkifytracksplaceholder') || instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
   let playingNowLnk
   if (placeholder) {
       const parsedAudio = parseAudio();
       const trackList = `${parsedAudio.scrollContainer}`;
       placeholder.outerHTML = trackList;
       playingNowLnk = parsedAudio.nowPlayingUrl.replace(/^\//, '');
       if (instance.popper.querySelector('.loadMore')) {
           instance.popper.querySelector('.musfooter .playingNow').innerHTML = `<img src="data:image/gif;base64,R0lGODlhIAAIAKECAEVojoSctMHN2QAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAIAAIAAACFZyPqcvtD6KMr445LcRUN9554kiSBQAh+QQFCgADACwCAAIAEgAEAAACD4xvM8DNiJRz8Mj5ari4AAAh+QQFCgADACwCAAIAHAAEAAACGJRvM8HNCqKMCCnn4JT1XPwMG9cJH6iNBQAh+QQFCgADACwMAAIAEgAEAAACD5RvM8HNiJRz8Mj5qri4AAAh+QQFCgADACwWAAIACAAEAAACBZSPqYsFACH5BAUUAAMALAAAAAAgAAgAAAIOnI+py+0Po5y02ouzPgUAOw==">`;
           instance.popper.querySelector('.loadMore').onclick = async function() {await loadMoreAudio();};
       }
   }
   u(`.audiosContainer .audioEmbed .audioEntry, .audios_padding .audioEmbed`).removeClass('nowPlaying');
   u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying')
   window.player.__updateFace();
   window.player.audioPlayer.onvolumechange();
   const acont = instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
   const aplaying = acont?.querySelector('.audioEntry.nowPlaying');
   if (acont && aplaying) {
       const aplayingRect = aplaying.getBoundingClientRect();
       const acontRect = acont.getBoundingClientRect();
       acont.scrollTo({
           top: aplayingRect.top - acontRect.top + acont.scrollTop - (acont.clientHeight / 2) + (aplayingRect.height / 2),
           behavior: 'smooth'
       });
   }
   if (/^(playlist\d+_\d+|audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
       if (/^(audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
           try {
               let plName = (await window.OVKAPI.call("users.get", {"user_ids": Number(playingNowLnk.match(/[^\d]*(\d+)/)[1]), "fields": "first_name"}))[0].first_name ;
               instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('audios')} <b>${escapeHtml(plName)}</b></a>`
           } catch(error)
           {
               console.error('failed to load playing now', error)
               instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
           }
       } if (/^(playlist\d+_\d+)(\?.*)?$/.test(playingNowLnk)) {
           try {
               let plName = (await window.OVKAPI.call("audio.getAlbums", {"owner_id": Number(playingNowLnk.match(/(\d+)_(\d+)/)[1])})).items.find(item => item.id === Number(playingNowLnk.match(/(\d+)_(\d+)/)[2])).title;
               instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('playlist')} <b>${escapeHtml(plName)}</b></a>`
           } catch(error)
           {
               console.error('failed to load playing now', error)
               instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
           }
       }
   } else {
       instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
   }
}});

function bindajtip(mushtml) {
tippy.delegate("body", {target: '#aj_player_track',
   content: mushtml,
   allowHTML: true,
   trigger: 'click',
   interactive: true,
   placement: 'left',
   theme: 'musicpopup',
   arrow: true,
   getReferenceClientRect: () => document.querySelector('#ajax_audio_player').getBoundingClientRect(),
   maxWidth: 627,
   width: 627,
   offset: [220, 19],
   appendTo: document.body,
   popperOptions: {
       strategy: 'fixed'
   },
   onHidden(instance) {
       window.musHtml = undefined;
   },
   async onMount(instance) {
    window.musHtml = instance.popper;
    const style = document.createElement("style");
    style.id = "fullajplayerstyles";
    style.textContent = `
            #ajax_audio_player {
                background-color: #66819e !important;
                opacity: 1 !important;
            }
            #aj_player_track_name * {
                color: #FFF !important;
            }
            #ajax_audio_player #aj_player_play #aj_player_play_btn.paused {
              background-position: -203px -28px !important;
            }
            #ajax_audio_player #aj_player_play #aj_player_play_btn {
              background-position: -183px -28px !important;
            }
			#ajax_audio_player #aj_player_close_btn {
			  filter: brightness(100);
			}
        `;
    document.head.appendChild(style);
       instance.popperInstance.update()
       const placeholder = instance.popper.querySelector('.vkifytracksplaceholder') || instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
       let playingNowLnk
       if (placeholder) {
           const parsedAudio = parseAudio();
           const trackList = `${parsedAudio.scrollContainer}`;
           placeholder.outerHTML = trackList;
           playingNowLnk = parsedAudio.nowPlayingUrl.replace(/^\//, '');
           if (instance.popper.querySelector('.loadMore')) {
               instance.popper.querySelector('.musfooter .playingNow').innerHTML = `<img src="data:image/gif;base64,R0lGODlhIAAIAKECAEVojoSctMHN2QAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgADACwAAAAAIAAIAAACFZyPqcvtD6KMr445LcRUN9554kiSBQAh+QQFCgADACwCAAIAEgAEAAACD4xvM8DNiJRz8Mj5ari4AAAh+QQFCgADACwCAAIAHAAEAAACGJRvM8HNCqKMCCnn4JT1XPwMG9cJH6iNBQAh+QQFCgADACwMAAIAEgAEAAACD5RvM8HNiJRz8Mj5qri4AAAh+QQFCgADACwWAAIACAAEAAACBZSPqYsFACH5BAUUAAMALAAAAAAgAAgAAAIOnI+py+0Po5y02ouzPgUAOw==">`;
               instance.popper.querySelector('.loadMore').onclick = async function() {await loadMoreAudio();};
           }
       }
       u(`.audiosContainer .audioEmbed .audioEntry, .audios_padding .audioEmbed`).removeClass('nowPlaying');
       u(`.audiosContainer .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry, .audios_padding .audioEmbed[data-realid='${window.player.current_track_id}'] .audioEntry`).addClass('nowPlaying');
       window.player.__updateFace();
       window.player.audioPlayer.onvolumechange();
       const acont = instance.popper.querySelector('.audiosContainer.audiosSideContainer.audiosPaddingContainer');
       const aplaying = acont?.querySelector('.audioEntry.nowPlaying');
       if (acont && aplaying) {
           const aplayingRect = aplaying.getBoundingClientRect();
           const acontRect = acont.getBoundingClientRect();
           acont.scrollTo({
               top: aplayingRect.top - acontRect.top + acont.scrollTop - (acont.clientHeight / 2) + (aplayingRect.height / 2),
               behavior: 'smooth'
           });
       }
       if (/^(playlist\d+_\d+|audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
           if (/^(audios-?\d+)(\?.*)?$/.test(playingNowLnk)) {
               try {
                   let plName = (await window.OVKAPI.call("users.get", {"user_ids": Number(playingNowLnk.match(/[^\d]*(\d+)/)[1]), "fields": "first_name"}))[0].first_name;
                   instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('audios')} <b>${escapeHtml(plName)}</b></a>`
               } catch(error)
               {
                   console.error('failed to load playing now', error)
                   instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
               }
           } if (/^(playlist\d+_\d+)(\?.*)?$/.test(playingNowLnk)) {
               try {
                   let plName = (await window.OVKAPI.call("audio.getAlbums", {"owner_id": Number(playingNowLnk.match(/_(\d+)$/)[0])})).items.find(item => item.id === Number(playingNowLnk.match(/_(\d+)$/)[1])).title;
                   instance.popper.querySelector('.musfooter .playingNow').innerHTML = `${window.vkifylang.currentlyplaying}<a onclick="tippy.hideAll();" href=${playingNowLnk}>${tr('playlist')} <b>${escapeHtml(plName)}</b></a>`
               } catch(error)
               {
                   console.error('failed to load playing now', error)
                   instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
               }
           }
       } else {
           instance.popper.querySelector('.musfooter .playingNow').innerHTML = ``
       }
   },
   onHide(instance) {
       document.querySelector("#fullajplayerstyles").remove()
   }
    });
};
bindajtip(mushtml);

CMessageBox.prototype.__getTemplate = function() {
        return u(
`<div class="ovk-diag-cont ovk-msg-all" data-id="${this.id}">
      <div class="ovk-diag">
         <div class="ovk-diag-head">${this.title}<div class="ovk-diag-head-close" onclick="CMessageBox?.prototype.__close2()">${tr('close')}</div></div>
         <div class="ovk-diag-body">${this.body}</div>
         <div class="ovk-diag-action"></div>
      </div>
 </div>`)
};

CMessageBox.prototype.__close2 = async function() {
   const msg = window.messagebox_stack[window.messagebox_stack.length - 1]
   if(!msg) {
      return
   }
   if(msg.close_on_buttons) {
      msg.close()
      return
   }
   if(msg.warn_on_exit) {
      const res = await msg.__showCloseConfirmationDialog()
      if(res === true) {
         msg.close()
      }
   }
}
});

const searchbox = document.querySelector('#search_box form input[type="search"]');
var searchTimeout;
var fri
searchbox.onfocus = function() {if (!(searchbox.value.length < 3)) {document.querySelector('#searchBoxFastTips').style.display = "block";}
                                else {document.querySelector('#searchBoxFastTips').style.display = "none";}}
searchbox.onblur = function() {
    if (searchbox.value == "") {if (friendson > 0) {document.querySelector('.friendslink').style.display = "unset";}}
    else {document.querySelector('.friendslink').style.display = "none";}}
searchbox.oninput = async function() {
    if (!(searchbox.value.length < 3)) {document.querySelector('#searchBoxFastTips').style.display = "block";
                                        document.querySelector('.friendslink').style.display = "none";
                                        clearTimeout(searchTimeout);
                                        searchTimeout = setTimeout(async () => {
                                            const srq = document.querySelector('#search_box form input[type="search"]').value;
                                            document.querySelector('#searchBoxFastTips').innerHTML = `<div class="fastpreload"></div>`;
                                            try {
                                            const groupsd = await window.OVKAPI.call("groups.search", {"q": srq})
                                            const usersd = await window.OVKAPI.call("users.search", {"q": srq, "fields": "photo_50"})
                                            const audiosd = await window.OVKAPI.call("audio.search", {"q": srq})
                                            const docsd = await window.OVKAPI.call("docs.search", {"q": srq})
                                            if (usersd.count > 5 ) {
                                                var minusers = usersd.items
                                                .slice(0, 5)
                                                .map(item => ({
                                                    id: item.id,
                                                    photo_50: item.photo_50,
                                                    first_name: item.first_name
                                                }));
                                            } else {
                                                var minusers = usersd.items
                                                .slice(0, usersd.count)
                                                .map(item => ({
                                                    id: item.id,
                                                    photo_50: item.photo_50,
                                                    first_name: item.first_name
                                                }));
                                            }
                                            let fastusers = ""
                                            minusers.forEach((user, index) => {
                                                fastusers += `
                                                            <a class="fastavatarlnk" href="/id${user.id}">
                                                              <img class="fastavatar" src="${user.photo_50}">
                                                              <span>${escapeHtml(user.first_name)}</span>
                                                            </a>
                                                          `;
                                            });
                                            document.querySelector('#searchBoxFastTips').innerHTML = `
                                <div>
                                    <div class="useravas">
                                        ${fastusers}
                                    </div>
                                    <a href="/search?section=users&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('users')} <b>${escapeHtml(srq)}</b> (${usersd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=groups&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('groups')} <b>${escapeHtml(srq)}</b> (${groupsd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=audios&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('audios')} <b>${escapeHtml(srq)}</b> (${audiosd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=docs&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('documents')} <b>${escapeHtml(srq)}</b> (${docsd.count})
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                            `} catch (error) {
                                console.error('failed to load search tip results, using simple template:', error)
                                document.querySelector('#searchBoxFastTips').innerHTML = `
                                <div>
                                    <a href="/search?section=users&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('users')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=groups&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('groups')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=audios&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('audios')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                                <div>
                                    <a href="/search?section=docs&q=${srq}">
                                        <div class="fastresult">
                                            ${tr('documents')} <b>${escapeHtml(srq)}</b>
                                            <div class="arrow"></div>
                                        </div>
                                    </a>
                                </div>
                            `}
                                        }, 1500);}
    else {document.querySelector('#searchBoxFastTips').style.display = "none";
	if (friendson > 0) {document.querySelector('.friendslink').style.display = "unset";}}}
/* я украл эту хрень из исходников, хз как оно работает лол */
u(`#search_box form input[type="search"]` || `#search_box #searchBoxFastTips a`).on('blur', (e) => { {
    setTimeout(() => {
        const focusedElement = document.activeElement;

        if (!u(focusedElement).is('#search_box form input[type="search"]')) {
            $('#searchBoxFastTips').css("display", "none")
        }
    }, 250);
} /* ладно я понял как оно работает и поэтому я в целом убрал время ОЖИДания */
                                                                                                 })
u(`#search_box form input[type="search"]`).off('focus');


async function changeStatus() {
    const status = document.status_popup_form.status.value;
    const broadcast = document.status_popup_form.broadcast.checked;

    document.status_popup_form.submit.innerHTML = "<div class=\"button-loading\"></div>";
    document.status_popup_form.submit.disabled = true;

    const formData = new FormData();
    formData.append("status", status);
    formData.append("broadcast", Number(broadcast));
    formData.append("hash", document.status_popup_form.hash.value);
    const response = await ky.post("/edit?act=status", {body: formData});

    if(!parseAjaxResponse(await response.text())) {
        document.status_popup_form.submit.innerHTML = tr("send");
        document.status_popup_form.submit.disabled = false;
        return;
    }

    if(document.status_popup_form.status.value === "") {
        document.querySelector("#page_status_text").innerHTML = `${tr("change_status")}`;
        document.querySelector("#page_status_text").className = "edit_link page_status_edit_button";
    } else {
        document.querySelector("#page_status_text").innerHTML = escapeHtml(status);
        document.querySelector("#page_status_text").className = "page_status page_status_edit_button";
    }

    setStatusEditorShown(false);
    document.status_popup_form.submit.innerHTML = tr("send");
    document.status_popup_form.submit.disabled = false;
}

function switchProfileInfo() {
	const infoblock = document.querySelector('.profileinfoblock')
	const infobtn = document.querySelector('#showFullInfoButton')
	if (infoblock && infobtn) {
		if (infoblock.style.display === "none") {
			infoblock.style.display = "block"
			infobtn.text = tr('close_comments')
		} else {
			infoblock.style.display = "none"
			infobtn.text = tr('show_comments')
		}
	}
}

const today = new Date();
if (today.getDate() === 1 && today.getMonth() === 3) {
	const doge = document.createElement('script');
	doge.setAttribute('src','/themepack/vkify/2.0.0.0/resource/doge.js');
	document.head.appendChild(doge);
	u(document).on('click', '.post-like-button', function () {
		if (u(this).find('#liked').length) {Doge.show();}
	});
}

